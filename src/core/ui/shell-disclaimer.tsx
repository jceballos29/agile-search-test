import { CheckOutlined, FieldTimeOutlined, NotificationOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Alert, Badge, Button, Modal, Row, Col, Tooltip } from 'antd'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import logo from '../assets/fi-group.png'
import { useHistory } from 'react-router'
import HttpService from '../services/http.service'
import { container } from '../../inversify.config'
import { QueryResult } from '../stores/data-store'

interface Props extends WithTranslation, IdentityProps {
}

const ShellDisclaimer: FC<Props> = (props) => {
    const { t } = props
    const history = useHistory()
    const [busy, setBusy] = useState<boolean>(false)
    const [showModal, setShowModal] = useState<boolean>(false)

    const httpService = useMemo(() => container.get(HttpService), [])

    const inputRef = React.useRef()
    React.useEffect(
        () => {
            setBusy(true)
            httpService.get<{ accepted: boolean }>(props.identity.identityUrl + "/api/v1/profile/disclaimer/" + props.identity.id + "/" + props.identity.applicationName).then(result => {

                setShowModal(!result.data.accepted);

            }).catch(error => {
                setBusy(false)
            })
        }, [inputRef]
    )

    const acceptDisclaimer = () => {

        setBusy(true)
        httpService.post(props.identity.identityUrl + "/api/v1/profile/disclaimer/" + props.identity.id + "/" + props.identity.applicationName, {}).then(result => {

        }).catch(error => {
            setBusy(false)
        })

        setShowModal(false)
    }

    return (
        <> {showModal &&
            <>
                <Modal
                    style={{ background: "ligthgray" }}
                    centered
                    title={null}
                    width={"80%"}
                    footer={null}
                    closable={false}
                    visible={showModal}
                    onOk={() => setShowModal(false)}
                >
                    <img style={{ padding: '0 30px' }} alt="fi-logo" width={150} src={logo} />
                    <Row>
                        <Col span={24}>
                            <div style={{ padding: 30 }}>
                            <p style={{ color: "rgb(0,0,164)", fontSize: 20 }}>{t("disclaimer_text")}<Tooltip title={t('disclaimer_specification')} getPopupContainer={(triggerNode) => triggerNode}><InfoCircleOutlined /></Tooltip></p>
                                <p style={{ color: "rgb(0,0,164)", fontSize: 20 }}><span dangerouslySetInnerHTML={{ __html: t("disclaimer_profile") }} /></p>
                            </div>
                        </Col>
                        <Col span={24}>
                            <Button style={{ float: "right" }} onClick={() => acceptDisclaimer()} type="primary">{t("Ok")}</Button>
                            <a href={props.identity.identityUrl + "/profile/rights"} target="_blank">
                                <Button style={{ float: "right", marginRight: 10 }} >{t("Go to Profile")}</Button>
                            </a>
                        </Col>
                    </Row>
                </Modal>
            </>

        }
            {props.children}
        </>
    )
}

export default withIdentity(withTranslation()(ShellDisclaimer))
