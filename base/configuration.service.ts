import { injectable } from "inversify"
import * as Axios from "axios"
import autobind from "autobind-decorator"

export interface AppConfiguration {
  serviceUrl: string
  apps: string[],
  scopes: string,
  clientId: string,
  identityServerUrl: string,
  environment: string,
}

@injectable()
export class ConfigurationService {
  public static configuration: AppConfiguration | undefined = undefined;


  @autobind
  public current(): Promise<AppConfiguration> {
    if (ConfigurationService.configuration) {
      return Promise.resolve(ConfigurationService.configuration)
    }
    return new Promise((resolve, reject) => {
      var http = Axios.default.create({
        timeout: 30000,
      })
      http.get("/api/v1/config")
        .then((result: any) => {
          ConfigurationService.configuration = {
            serviceUrl: result.data.serviceUrl,
            apps: result.data.apps,
            scopes: result.data.scopes,
            clientId: result.data.clientId,
            identityServerUrl: result.data.identityServerUrl,
            environment : result.data.environment
          } as AppConfiguration
          resolve(ConfigurationService.configuration)
        })
        .catch(reject)
    })
  }
}