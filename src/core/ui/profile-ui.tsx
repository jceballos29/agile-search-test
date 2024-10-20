import React, { FC, useEffect, useState } from 'react'
import { Button, Col, Divider, Drawer, Modal, Row, Spin, notification } from 'antd'
import { container } from 'src/inversify.config'
import { withTranslation, WithTranslation } from 'react-i18next'
import HttpService from 'src/core/services/http.service'
import { QueryResult } from 'src/core/stores/data-store'
import { KeyOutlined, LoadingOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons'
import { IdentityProps, isInRole, withIdentity } from 'src/core/services/authentication'
import './profile-ui.css'
import { getGravatar } from '../utils/gravatar'
import Avatar from 'antd/lib/avatar/avatar'
import { Link } from 'react-router-dom'
import { NotificationPlacement } from 'antd/lib/notification'




interface Props extends WithTranslation, IdentityProps {
  onClose: () => void
  identityUrl: string

}


const ProfileView: FC<Props> = ({ onClose, t, identity }) => {

  const httpService = container.get(HttpService)
  const [busy, setBusy] = React.useState(false)
  const inputRef = React.useRef()
  const [error, setError] = useState<string>(undefined)
 
  const [avatarUrl, setAvatarUrl] = useState(getGravatar(identity.profile.email, 400))
  const [changePasswordRequest, setChangePasswordRequest] = useState<boolean>(false)


  const onChangePassword = async () => {
    setChangePasswordRequest(true)
    try {
      var httpService = container.get(HttpService)
      await httpService.get<string>(`${identity.identityUrl}/api/v1/profile/resetPassword/` + identity.name)
      Modal.info({
        title: t('Change password request Success'),
        content: (
          <div>
            <p>{t('Please check your email inbox. We have sent instructions on how reset your password.')}</p>
          </div>
        ),
        onOk() { }
      })
    }
    catch {
      Modal.error({
        title: t('Change password request fail'),
        content: (
          <div>
            <p>{t('Please contact to an Administrator')}</p>
          </div>
        ),
        onOk() { }
      })
    }
   
    setChangePasswordRequest(false)
  }

  React.useEffect(
    () => {
    }, [inputRef]
  )

  return (
    <Modal
      className="modal-profile"
      visible
      style={{ top: 50, right: 20, float: "right" }}
      onOk={() => onClose()}
      onCancel={() => onClose()}
      width={400}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>

        </>
      )}
    >
      <p style={{ textAlign: "center", fontWeight: "bold" }}>{identity.name}</p>
      <Row gutter={16}>
        <Col span={24} style={{ textAlign: 'center' }} className='avatar-container'>
          <Avatar size={200} style={{ border: "solid 4px lightgray" }} src={avatarUrl} />
        </Col>
        <Col span={24} style={{ textAlign: 'center' }} className='avatar-container'>
          <p style={{ textAlign: "center", fontSize: 18, fontWeight: "bold", color: "rgb(0,0,164)" }}>{t("Hi, ") + identity.firstName}</p>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }} className='avatar-container'>

          <Button onClick={() => window.location.href = identity.identityUrl + "/profile"} style={{ width: 290 }} type="primary" icon={<UserOutlined></UserOutlined>} >
            {t('Your Profile')}
          </Button>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }} className='avatar-container'>
          <Button loading={changePasswordRequest} style={{ width: 290 }} onClick={() => onChangePassword()} type="primary" icon={<KeyOutlined></KeyOutlined>} >
            {t('Change password')}
          </Button>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }} className='avatar-container'>
          <Button style={{ width: 290 }} onClick={() => identity.logout()} danger type="primary" icon={<LoginOutlined></LoginOutlined>} >
            {t('Close session')}
          </Button>
        </Col>
      </Row>


    </Modal>
  )
}

export default withTranslation()(withIdentity(ProfileView))
