import { CheckOutlined, FieldTimeOutlined, NotificationOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Badge, Button } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import { useIdleTimer } from 'react-idle-timer'

interface Props extends WithTranslation, IdentityProps {
  timeout?: number
}

const ShellIdleApp: FC<Props> = (props) => {
  const { t } = props
  const [isIdle, setIsIdle] = useState(false)

  const [secondsToGo, setSecondsToGo] = useState<number>(5);

  const countDown = () => {

    let timeToGo = 5;
    const timer = setInterval(() => {
      timeToGo -= 1
      setSecondsToGo(timeToGo)
    }, 1000)

    setTimeout(() => {
      clearInterval(timer)
      props.identity.logout()
    }, timeToGo * 1000)
  };

  const onPrompt = () => {
  }

  const onIdle = () => {
    if (!isIdle)
      countDown();
    setIsIdle(true)
  }

  const onActive = (event) => {
  }

  const { }
    = useIdleTimer({
      onPrompt,
      onIdle,
      onActive,
      timeout: props.timeout || 1000 * 60 * 20,
      promptTimeout: 0,
      events: [
        'mousemove',
        'keydown',
        'wheel',
        'DOMMouseScroll',
        'mousewheel',
        'mousedown',
        'touchstart',
        'touchmove',
        'MSPointerDown',
        'MSPointerMove',
        'visibilitychange'
      ],
      immediateEvents: [],
      debounce: 0,
      throttle: 0,
      eventsThrottle: 200,
      element: document,
      startOnMount: true,
      startManually: false,
      stopOnIdle: false,
      crossTab: false,
      name: 'idle-timer',
      syncTimers: 0,
      leaderElection: false
    })

  return (
    <> {isIdle &&
      <div className={'modal-idle-app-shadow'}>
        <div className={'modal-idle-app'}>
          <div className={'header-modal-idle-app'}></div>
          <div className={'body-modal-idle-app'}>
            <FieldTimeOutlined style={{ fontSize: 60, marginBottom: 20, color: "rgb(0,0,164)" }} />
            <Alert
              message={t("Your session has expired.")}
              description={t("This will redirect to Login page in") + " " + secondsToGo + " " + t("seconds") + "..."}
              type="warning"
              showIcon
            />
            <Button style={{ marginTop: 20 }} onClick={() => props.identity.logout()} type="primary" icon={< CheckOutlined />}>
              {t("Ok")}
            </Button>
          </div>
        </div>
      </div>
    }
      {props.children}
    </>
  )
}

export default withIdentity(withTranslation()(ShellIdleApp))
