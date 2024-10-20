import React, { FC, useEffect, useState } from 'react'
import { Button, Col, Divider, Drawer, Row, Spin } from 'antd'
import { container } from 'src/inversify.config'
import { withTranslation, WithTranslation } from 'react-i18next'
import HttpService from 'src/core/services/http.service'
import { QueryResult } from 'src/core/stores/data-store'
import { LoadingOutlined } from '@ant-design/icons'
import { IdentityProps, isInRole, withIdentity } from 'src/core/services/authentication'
import './my-apps.css'

interface AppItem {
  id: string,
  title: string,
  description: string,
  icon: string,
  privateUrl: string,
  publicUrl: string,
  prerelease: boolean,
  hasAccess: boolean,
}


interface Props extends WithTranslation, IdentityProps {
  onClose: () => void
  visible: boolean
  identityUrl: string
  className? : string 

}

const AppIcon: FC<{ icon?: string; id?: string, identityUrl: string, backcolor?: string }> = (props) => {
  const httpService = container.get(HttpService)
  const [busy, setBusy] = React.useState(false)
  const [iconSource64, setIconSource64] = useState(props.icon)
  const inputRef = React.useRef()

  React.useEffect(() => {
      if (props.id) {
      setBusy(true)
      httpService
        .get<QueryResult<AppItem>>(`${props.identityUrl}/api/v1/applications/icon/${props.id}`)
        .then((result) => {
          setIconSource64(result.data as any)
          setBusy(false)
        })
        .catch((error) => {
          setBusy(false)
        })
    }
  }, [inputRef])

  return !busy ? (
    <div style={{ height: 48, width: 48, backgroundColor: props.backcolor ? props.backcolor : '#0000A4', borderRadius: 25 }}>
      <img width={48} height={48} src={iconSource64} />
    </div>
  ) : (
    <LoadingOutlined style={{ fontSize: '48px', color: '#0000A4' }} />
  )
}

const MyAppsView: FC<Props> = ({ onClose, t, visible, identity, className }) => {

  const httpService = container.get(HttpService)
  const [applist, setApplist] = useState<AppItem[]>([])
  const [busy, setBusy] = React.useState(false)
  const inputRef = React.useRef()
  const [additionalApps, setAdditionalApps] = useState<AppItem[]>([])
  const [error, setError] = useState<string>(undefined)


  const hasAccessWrapper = (app: AppItem): boolean => {
    return (
      app.hasAccess && (app.title !== 'Identity Management' || isInRole(identity, ['Administrator']))
    )
  }

  React.useEffect(
    () => {
      setBusy(true)
      httpService.get<QueryResult<AppItem>>(identity.identityUrl + "/api/v1/applications/info/" + identity.id).then(result => {

        let currentAppUrl = window.location.href;
        const filteredApps = result.data.items.filter(app => !app.prerelease && (app.publicUrl !== currentAppUrl && app.privateUrl !== currentAppUrl));        
        const sortedApps = filteredApps.sort((a, b) =>
              a.title.localeCompare(b.title)
        );

        setApplist(sortedApps.filter(o => hasAccessWrapper(o)))
        setAdditionalApps(sortedApps.filter(o => !o.hasAccess && o.publicUrl && o.publicUrl != "")),
        setBusy(false)

      }).catch(error => {
        setBusy(false)
        setError(error)
      })
    }, [inputRef]
  )


  return (
    <Drawer
      className={"my-apps home-page " + className ?? ""}
      title={t('My apps')}
      width={650}
      placement="right"
      closable={true}
      onClose={() => {
        onClose()
      }}
      visible={visible}
    >
      <Spin spinning={busy}>
        {applist.length > 0 &&
          (<>
            {applist.filter((item) => hasAccessWrapper(item)).length > 4 && (
              <Row>
                <Col span={12}>
                  {applist
                    .filter((item) => hasAccessWrapper(item))
                    .filter((item, index) => index % 2 === 0)
                    .map((app) => (
                      <a href={app.privateUrl || '#'}>
                        <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'left', marginBottom: 8 }}>
                          <div style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>
                            <AppIcon id={app.id} identityUrl={identity.identityUrl} />
                          </div>
                          <h3 style={{ marginBottom: 'auto', marginTop: 'auto', fontSize: 14 }}>{app.title}</h3>
                        </div>
                      </a>
                    ))}
                </Col>
                <Col span={12}>
                  {applist
                    .filter((item) => hasAccessWrapper(item))
                    .filter((item, index) => index % 2 === 1)
                    .map((app) => (
                      <a href={app.privateUrl || '#'} className="app-link">
                        <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'left', marginBottom: 8 }}>
                          <div style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>
                            <AppIcon id={app.id} identityUrl={identity.identityUrl} />
                          </div>
                          <h3 style={{ marginBottom: 'auto', marginTop: 'auto', fontSize: 14 }}>{app.title}</h3>
                        </div>
                      </a>
                    ))}
                </Col>
              </Row>
            )}
            {applist.filter((item) => hasAccessWrapper(item)).length <= 4 && (
              <Row>
                <Col span={24}>
                  {applist
                    .filter((item) => hasAccessWrapper(item))
                    .map((app) => (
                      <a href={app.privateUrl || '#'}>
                        <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'left', marginBottom: 8 }}>
                          <div style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>
                            <AppIcon id={app.id} identityUrl={identity.identityUrl} />
                          </div>
                          <h3 style={{ marginBottom: 'auto', marginTop: 'auto', fontSize: 14 }}>{app.title}</h3>
                        </div>
                      </a>
                    ))}
                </Col>
              </Row>
            )}
            {additionalApps.length > 0 && <>
              <Divider />
              <h4 className="home-header" style={{ marginBottom: "14px", color: "rgb(0,0,164)" }}>{t("Do you want to access these applications? Ask us!")}</h4>
              <div className={'app-aditionals'} style={{ paddingLeft: "0px" }}>
                <>
                  {additionalApps.length > 4 && (
                    <Row>
                      <Col span={12}>
                        {additionalApps
                          .filter((item, index) => index % 2 === 0)
                          .map((app) => (
                            <a href={"https://es.fi-group.com/servicio/fi-connect/" || '#'}>
                              <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'left', marginBottom: 8 }}>
                                <div style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>
                                  <AppIcon backcolor="gray" id={app.id} identityUrl={identity.identityUrl} />
                                </div>
                                <h3 style={{ marginBottom: 'auto', marginTop: 'auto', fontSize: 14 }}>{app.title}</h3>
                              </div>
                            </a>
                          ))}
                      </Col>
                      <Col span={12}>
                        {additionalApps
                          .filter((item, index) => index % 2 === 1)
                          .map((app) => (
                            <a href={"https://es.fi-group.com/servicio/fi-connect/" || '#'} className="app-link">
                              <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'left', marginBottom: 8 }}>
                                <div style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>
                                  <AppIcon backcolor="gray" id={app.id} identityUrl={identity.identityUrl} />
                                </div>
                                <h3 style={{ marginBottom: 'auto', marginTop: 'auto', fontSize: 14 }}>{app.title}</h3>
                              </div>
                            </a>
                          ))}
                      </Col>
                    </Row>
                  )}
                  {additionalApps.length <= 4 && (
                    <Row>
                      <Col span={24}>
                        {additionalApps
                          .map((app) => (
                            <a href={"https://es.fi-group.com/servicio/fi-connect/" || '#'}>
                              <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'left', marginBottom: 8 }}>
                                <div style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>
                                  <AppIcon backcolor="gray" id={app.id} identityUrl={identity.identityUrl} />
                                </div>
                                <h3 style={{ marginBottom: 'auto', marginTop: 'auto', fontSize: 14 }}>{app.title}</h3>
                              </div>
                            </a>
                          ))}
                      </Col>
                    </Row>
                  )}

                </>
              </div></>}
          </>)}
      
      </Spin>
    </Drawer>
  )
}

export default withTranslation()(withIdentity(MyAppsView))
