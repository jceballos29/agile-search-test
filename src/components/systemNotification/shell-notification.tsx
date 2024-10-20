import { NotificationOutlined } from '@ant-design/icons'
import { Badge, Tooltip } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import SideView from '../side-view'
import NotificationList from './notification-list'
import { HubConnectionBuilder } from '@microsoft/signalr'
import './notifications.less'
import { infoNotification } from './notificationService'
import { IdentityProps, withIdentity } from '../../core/services/authentication'

interface Props extends WithTranslation, IdentityProps { }

const ShellNotification: FC<Props> = (props) => {
  const { t, identity } = props
  const [notificationNumber, setNotificationNumber] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [reload, setReload] = useState(-1)
  const isAdmin = identity.roles.filter((o) => o.includes('Administrator')).length > 0;
  const onlyCountryViewer = (identity.roles ? identity.roles : [])
      .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

  useEffect(() => {
    const connection = new HubConnectionBuilder().withUrl(`${process.env.PUBLIC_URL}/hubs/notifications`).withAutomaticReconnect().build()
    connection
      .start()
      .then(() => {
        connection.on('NewNotification', (data: any) => {
          if (data.userId === props.identity.id) {
            setReload(data.unreadNotification * new Date().getTime())
            setNotificationNumber(data.unreadNotification)
            infoNotification(t('New Notification'), t(data.notification.description))
          }
        })
      })
      .catch((e: Error) => console.log('Connection failed: ', e))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {props.children}
      {!onlyCountryViewer &&
        <div className={'messageFloatingNotification'}>
          <div
            data-testid="openNotificationsButton"
            className={notificationNumber > 0 ? 'floatingNotification-container messages' : 'floatingNotification-container nomessages'}
            onClick={() => {
              setIsOpen(!isOpen)
            }}
          >
            <Tooltip title={t('Notifications')} placement="topRight">
              <Badge count={notificationNumber}>
                <NotificationOutlined style={{
                  fontSize: '32px', marginTop: 12, color: 'white'
                }} />
              </Badge>
            </Tooltip>
          </div>
        </div>
      }
      <SideView className="notifications-flyout" mask={false} getContainer={false} onClose={() => setIsOpen(false)} visible={isOpen}>
        <NotificationList reload={reload} visible={isOpen} setNotificationCount={(count: number) => setNotificationNumber(count)} />
      </SideView>
    </>
  )
}

export default withIdentity(withTranslation()(ShellNotification))
