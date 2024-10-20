import { WithTranslation, withTranslation } from "react-i18next"
import { UserProfileProps, withUserProfile } from "../user-profile"
import { FC, useEffect, useState } from "react"
import { Badge, Button, Card, Modal, Tooltip } from "antd"
import { FeaturedMessageStorageSummary } from "src/stores/featured-messages-store"
import { Query } from "src/core/stores/data-store"
import { container } from "src/inversify.config"
import { IdentityProps, withIdentity } from "src/core/services/authentication"
import { BellOutlined, BellTwoTone, InfoCircleTwoTone } from "@ant-design/icons"
import './notifications-featured-messages-style.less'

interface NotificationsFeaturedMessage extends WithTranslation, IdentityProps, UserProfileProps { }

const NotificationsFeaturedMessages: FC<NotificationsFeaturedMessage> = ({ t, identity }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery] = useState('');
  const [messagesCount, setMessageCount] = useState(0);
  const [query] = useState({
    searchQuery: searchQuery,
    skip: 0,
    take: 10,
    orderBy: [{ field: 'messageTitle', direction: 'Ascending', useProfile: true }]
  } as Query);
  const [isPrimary, setIsPrimary] = useState(false);
  const featuredMessageNotificationsStore = container.get(FeaturedMessageStorageSummary);
  const featuredMessageNotificationsState = featuredMessageNotificationsStore.state;
  const Load = async (searchQuery: Query = query) => {
    await featuredMessageNotificationsStore.load(searchQuery).then((e) => setMessageCount(featuredMessageNotificationsState.count.value || 0))
  }

  useEffect(() => {
    Load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={"featured-message"} style={{ float: 'right', marginRight: 30 }}>
      <Badge count={messagesCount}>
          <Button
            shape="round"
            className={!isPrimary ? 'fi-light-blue-button-new' : undefined}
            type={isPrimary ? 'primary': undefined}
            onClick={() => { setIsPrimary(true); setShowModal(true) }}
            icon={<BellOutlined style={{color: !isPrimary ? "#0000a4": undefined}} />}
          >
          {t("Featured Messages")}
          </Button>
      </Badge>
      <Modal className={"featured-message-modal"} width={"50%"} title={<><InfoCircleTwoTone />&nbsp;&nbsp;{t("Latest notifications")}</>} visible={showModal} closeIcon={null} onOk={() => { setIsPrimary(false); setShowModal(false); }} onCancel={() => { setIsPrimary(false); setShowModal(false); }} footer={null}>
        {messagesCount > 0 ?
          featuredMessageNotificationsState.items.get().map(m => 
            <Card key={m.messageTitle} id={m.messageTitle} className={"featured-message-card"} title={<><BellTwoTone />&nbsp;&nbsp;{t(m.messageTitle)}</>}>{t(m.message)}</Card>
          )
          :
          <span>{t("No featured messages")}</span>
        }
      </Modal>
    </div>
  )
}

export default withIdentity(withTranslation()(withUserProfile(NotificationsFeaturedMessages)))