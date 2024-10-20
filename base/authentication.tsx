import * as React from 'react';
import Oidc from 'oidc-client';
import 'src/core/assets/loader.css';
import HttpService from './http.service';
import autobind from 'autobind-decorator';
import 'src/core/utils/linq';
import jwt_decode from 'jwt-decode';

(window as any).toggleOidcDebug = (active:boolean=true) => {
  const nopLogger = {
    debug(){},
    info(){},
    warn(){},
    error(){}
  };
  Oidc.Log.level = active? Oidc.Log.DEBUG : Oidc.Log.NONE;
  Oidc.Log.logger = active? console : nopLogger;
  console.log(`Oidc Debug ${active? 'enabled' : 'disabled'}`);
}


interface SecureContentProps {
  config: AuthenticationConfig;
  children?: React.ReactNode;
  authenticatingView?: React.ReactNode;
  onAuthentication?: (result: AuthenticationResult) => void;
}

interface SecureContentStatus {
  authenticating: boolean,
  result: AuthenticationResult | undefined,
  error: string | undefined
}

function AuthenticatingView(props: any) {
  return <div className="loaderContainer">
    <div className="loader">
      <div className="circle">&nbsp;</div>
      <div className="circle">&nbsp;</div>
      <div className="circle">&nbsp;</div>
      <div className="circle">&nbsp;</div>
    </div>
  </div>;
}

interface AuthenticationConfig {
  clientId: string,
  authority?: string,
  resource?: string,
  redirectUri?: string,
  silentRedirectUri?: string,
  passthrough?: string,
  extraQueryParameter?: string
}

export interface AuthenticationResult {
  id: string | undefined;
  name: string | undefined;
  displayName: string | undefined;
  idToken: string | undefined;
  accessToken: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  roles: string[] | undefined;
  scopes: string[] | undefined;
  groups: string[] | undefined;
  profile: any | undefined;
  error: string | undefined;
  identityUrl: string;
  applicationName: string;
  logout: () => Promise<any>;
}

function ensureArray(item: any): any {
  if (Array.isArray(item))
    return item;
  if (!item)
    return [];
  return [item];
}

class AuthenticationService {
  private config: AuthenticationConfig;
  private _identityToken: undefined | string;
  private _accessToken: undefined | string;
  private _user: undefined | string;
  private _authenticationContext: Oidc.UserManager | undefined = undefined;

  public get identityToken(): string | undefined {
    return this._identityToken;
  }

  public get accessToken(): string | undefined {
    return this._accessToken;
  }

  public get user(): string | undefined {
    return this._user;
  }

  private get context() {
    this._identityToken = undefined;

    this.loginAsync = this.loginAsync.bind(this);
    this.logout = this.logout.bind(this);
    this.processResult = this.processResult.bind(this);
    return this._authenticationContext = new Oidc.UserManager({
      automaticSilentRenew: true,
      authority: this.config.authority,
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "id_token token",
      scope: `${this.config.resource}`,
      post_logout_redirect_uri: this.config.redirectUri,
      silent_redirect_uri: this.config.silentRedirectUri ?? this.config.redirectUri,
      loadUserInfo: true,
      userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })
    });
  }

  constructor(config: AuthenticationConfig) {
    this.config = config;
  }

  public logout() {
    return this.context.signoutRedirect();
  }

  public loginSilentAsync(): Promise<AuthenticationResult> {
    if (this.config.passthrough) {
      return Promise.resolve(this.processResult({ id_token: 'debug', access_token: 'debug', profile: this.config.passthrough }));
    }
    return new Promise((resolve, reject) => {
      var self = this;
      var mgr = this.context;
      mgr.signinSilentCallback().then(function () {
        mgr.getUser().then(function (user) {
          if (user && !user.expired && self.scopesAreValid(user.scopes)) {
            console.log("User logged in", user.profile);
            resolve(self.processResult(user));
          }
          else {
            console.log("User not logged in");
            mgr.signinSilent();
          }
        });
      }).catch(function (e) {
        mgr.getUser().then(function (user) {
          if (user && !user.expired && self.scopesAreValid(user.scopes)) {
            console.log("User logged in", user.profile);
            resolve(self.processResult(user));
          }
          else {
            console.log("User not logged in");
            mgr.signinSilent();
          }
        });
      });
    });
  }

  @autobind
  private scopesAreValid(userScopes: string[]): boolean {
    var requestedScopes = this.config!.resource!.split(" ");
    return requestedScopes.all(scope => userScopes.any(o => o === scope));
  }

  public loginAsync(): Promise<AuthenticationResult> {
    if (this.config.passthrough) {
      return Promise.resolve(this.processResult({ id_token: 'debug', access_token: 'debug', profile: this.config.passthrough }));
    }
    var self = this;
    const urlParams = new URLSearchParams(window.location.search);
    const urlAccessToken = urlParams.get('access_token');
    if (urlAccessToken) {
      try {
        // Try to decode JWT token
        let token = jwt_decode(urlAccessToken)
        return Promise.resolve(this.processResult({ id_token: urlAccessToken, access_token: urlAccessToken, profile: token }));
      } catch {
        // It might be a reference token
        return fetch(`${window.location.protocol}//${window.location.host}${process.env.PUBLIC_URL}/api/v1/profile`, {
          method: 'GET',
          headers: new Headers({
            'Authorization': `Bearer ${urlAccessToken}`
          })
        })
          .then(response => response.json())
          .then(data => {
            return self.processResult({ id_token: urlAccessToken, access_token: urlAccessToken, profile: data });
          });;
      }
    }
    return new Promise((resolve, reject) => {
      var self = this;
      var mgr = this.context;
      mgr.events.addUserLoaded(e => {
        self.processResult(e);
      })
      mgr.events.addUserSignedOut(function () {
        mgr.removeUser().then(result => mgr.signinSilent());
      });
      mgr.signinRedirectCallback().then(function () {
        mgr.getUser().then(function (user) {
          if (user && !user.expired && self.scopesAreValid(user.scopes)) {
            console.log("User logged in", user.profile);
            resolve(self.processResult(user));
          }
          else {
            console.log("User not logged in");
            mgr.signinRedirect({
              redirect_uri: self.getRedirectUriFromLocation(),
            });
          }
        });
      }).catch(function (e) {
        // mgr.getUser().then(function (user) {
        //     if (user && !user.expired && self.scopesAreValid(user.scopes)) {
        //         console.log("User logged in", user.profile);
        //         resolve(self.processResult(user));
        //     }
        //     else {
        //         console.log("User not logged in");
        //         mgr.signinRedirect({
        //          redirect_uri: self.getRedirectUriFromLocation(),
        //         });
        //     }
        // });
        mgr.signinRedirect({
          redirect_uri: self.getRedirectUriFromLocation(),
        });
      });
    });
  }

  private processResult(result: any): AuthenticationResult {
    this._identityToken = result.id_token;
    this._accessToken = result.access_token;
    this._user = result.profile;
    var profile = result.profile || {}
    HttpService.accessToken = result.access_token;
    let obj = {
      accessToken: result.access_token,
      idToken: result.id_token,
      profile: result.profile,
      error: undefined,
      firstName: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || profile["given_name"],
      lastName: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || profile["family_name"],
      id: profile["sub"],
      name: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"] || profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || profile["name"],
      email: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || profile["email"],
      roles: ensureArray(profile["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) || ensureArray(profile["role"]),
      scopes: ensureArray(profile["scope"]),
      groups: ensureArray(profile["group"]),
      logout: this.logout,
      identityUrl: this.config.authority,
      applicationName: this.config.clientId,
      displayName: undefined
    }
    let displayName = [];
    if (obj.firstName) {
      displayName.push(obj.firstName)
    }
    if (obj.lastName) {
      displayName.push(obj.lastName)
    }
    if (obj.email) {
      if (displayName.length > 0)
        displayName.push(`(${obj.email})`)
      else
        displayName.push(obj.email)
    }
    return obj;
  }

  private getRedirectUriFromLocation():string {
    const u = new URL(window.location.href);
    u.hash = '';
    return u.href;
  }
}

let authenticationService: AuthenticationService;

const { Provider, Consumer } = React.createContext<AuthenticationResult>(undefined as any);

class SecureContent extends React.Component<SecureContentProps, SecureContentStatus> {
  private authenticationService: AuthenticationService;

  constructor(props: SecureContentProps) {
    super(props);
    this.authenticationService = authenticationService = new AuthenticationService(props.config);
    this.state = {
      result: undefined,
      authenticating: true,
      error: undefined
    }

    this.authenticate = this.authenticate.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.authenticate().then(result => {
      this.setState({ authenticating: false, error: result.error });
      if (result && result.error == null) {
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
      }
      if (this.props.onAuthentication) {
        this.props.onAuthentication(result);
      }
    }).catch(error => {
      this.setState({ error: error });
    });
  }

  private authenticate(): Promise<AuthenticationResult> {
    return new Promise<AuthenticationResult>((resolve, reject) => {
      this.authenticationService.loginAsync().then(result => {
        this.setState({ result: result });
        resolve(result);
      }).catch(error => {
        resolve({
          id: undefined,
          name: undefined,
          displayName: undefined,
          idToken: undefined,
          accessToken: undefined,
          profile: undefined,
          error: error,
          email: undefined,
          firstName: undefined,
          lastName: undefined,
          roles: undefined,
          groups: undefined,
          scopes: undefined,
          logout: this.authenticationService.logout,
          identityUrl: this.props.config.authority,
          applicationName: this.props.config.clientId
        });
      });
    });
  }

  public render() {
    if (this.state.error) {
      return <div>
        <h1>ERROR</h1>
        <p>{JSON.stringify(this.state.error)}</p>
      </div>;
    }
    return (this.state.authenticating) ? (this.props.authenticatingView || <AuthenticatingView />) : (<Provider value={this.state.result as any}>{this.props.children}</Provider> || <div></div>);
  }
}

export interface IdentityProps {
  identity: AuthenticationResult
}

export function withIdentity<T extends React.ComponentType<any>>(Component: T) {
  // ...and returns another component...
  return function ComponentBoundWithAppContext(props: any) {
    // ... and renders the wrapped component with the current context!
    // Notice that we pass through any additional props as well
    return (
      <Consumer>
        {appContext => <Component {...props} identity={appContext} />}
      </Consumer>
    );
  };
}

export function isInRole(identity: AuthenticationResult, roles: string[]) {
  if (!identity || !identity.roles)
    return false;
  let exists = false;
  identity.roles.map(role => exists = exists || roles.filter(r => r === role).length > 0);
  return exists;
}

export { authenticationService };
export default SecureContent;