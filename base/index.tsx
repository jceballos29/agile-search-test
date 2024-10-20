/// <reference path="modules.d.ts" />
import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/index';
import './core/assets/site.less';
import './assets/app.less';
import { AppConfig, initialize as initializeInversify } from './inversify.config';
import 'src/core/utils/linq';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './core/utils/linq';
import SecureContent from 'src/core/services/authentication';
import CacheContent from 'src/core/services/cache.service';
import UserProfileSecureShell from 'src/components/user-profile';

//import registerServiceWorker from './registerServiceWorker';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

fetch(`${process.env.PUBLIC_URL}/api/v1/config`)
  .then((response) => response.json())
  .then((config) => {
    initializeInversify(config);
    ReactDOM.render(
      <BrowserRouter basename={baseUrl as string}>
        <AppConfig.Provider value={config}>
          <I18nextProvider i18n={i18n}>
            <SecureContent
              config={{
                authority: config!.identityServerUrl,
                redirectUri: config!.serviceUrl,
                silentRedirectUri: `${config!.serviceUrl}/silentrefresh.html`,
                resource: config!.scopes,
                clientId: config!.clientId,
                passthrough: config!.passthrough,
              }}
              onAuthentication={() => window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)}
            >
              <CacheContent scope="grants">
                <UserProfileSecureShell serviceUrl={config!.serviceUrl}>
                  <App />
                </UserProfileSecureShell>
              </CacheContent>
            </SecureContent>
          </I18nextProvider>
        </AppConfig.Provider>
      </BrowserRouter>,
      rootElement
    );
  });
