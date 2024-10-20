import { Button, Card, Col, Row } from 'antd'
import { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ContentHeader from 'src/core/ui/content-header'
import { container } from 'src/inversify.config'
import DataStore, { Query } from 'src/core/stores/data-store'
import { NotificationSubscriptionSummary, NotificationSubscriptionSummaryDataStore } from 'src/stores/notification-store'
import HttpService, { formatMessage } from '../../core/services/http.service'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { GetFlag } from '../../components/flags-icons'
import { TableView } from '../../core/ui/collections/table'
import NotificationSubscritionUpsertionModal from './notification-upsert-modal'
import { successNotification } from '../../components/systemNotification/notificationService'
import { formatDate } from '../../core/utils/object'

interface NotificationSubscriptionHomeProps extends WithTranslation, RouteComponentProps, CacheProps { 
  adminPage: false | boolean
}

const NotificationSubscriptionHome: FC<NotificationSubscriptionHomeProps> = (props) => {
  const { t, adminPage } = props
  const [open, setOpen] = useState(new URL(window.location.href).searchParams.get('open') == 'true' ?? false)
  const [showCreationModal, setShowCreationModal] = useState<boolean>(open)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | undefined>(undefined)
  const [loading, setLoading ] = useState<boolean>(false)

  useEffect(() => {
    currentStore.load(query)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [query, setQuery] = useState({
    searchQuery: '',
    orderBy: [{ field: 'createdOn', direction: 'Descending', useProfile: false }],
    skip: 0,
    take: 10,
    parameters: {
      adminPage: adminPage ? 1 : 0
    }
  } as Query)

  const httpService = container.get(HttpService)
  const currentStore = container.get(NotificationSubscriptionSummaryDataStore)
  const currentState = currentStore.state

  const tableColumns = [
    {
      searchable: true,
      field: 'title',
      title: t('Title'),
      renderer: (data: NotificationSubscriptionSummary) => 
        adminPage
        ? (
          <span>
            <span style={{ marginRight: 10 }}>{GetFlag(data.query?.countryCode ?? '', data.countryIcon ?? '')}</span>
            {data.title}
          </span>
        )
        : (
          <a
            onClick={() => {
              setSelectedNotificationId(data.id);
              setShowEditModal(true);
            }}
          ><span>
            <span style={{ marginRight: 10 }}>{GetFlag(data.query?.countryCode ?? '', data.countryIcon ?? '')}</span>
              {data.title}
            </span></a>
        )
    },
    {
      sortable: false,
      field: 'frequency',
      title: t('Frequency'),
      renderer: (data: NotificationSubscriptionSummary) => <span>{t(data.frequency)}</span>,
    },
    {
      sortable: true,
      field: 'modifiedOn',
      title: t('Modified On'),
      renderer: (data: NotificationSubscriptionSummary) => <span>{formatDate(data.modifiedOn)}</span>,
    },
  ];

  if(adminPage){
    tableColumns.push(...[{
      sortable: true,
      field: 'createdByDisplayName',
      title: t('Created by'),
      renderer: (data: NotificationSubscriptionSummary) => <span>{data.createdByDisplayName}</span>,
    },{
      sortable: true,
      field: 'ModifiedByDisplayName',
      title: t('Modified by'),
      renderer: (data: NotificationSubscriptionSummary) => <span>{data.modifiedByDisplayName}</span>,
    }])
  }

  const notificationTableModel = {
    query: query,
    columns: tableColumns,
    data: currentState.value,
    sortFields: [],
  }
  const onModalClose = () => {
    setShowCreationModal(false)
    setShowEditModal(false)
    setOpen(false)
    currentStore.load(query)
  }

  const downloadExcelTemplate = async () => {
    setLoading(true)
    await httpService.post(`api/v1/subscriptions/assigntemplate?`, {})
    successNotification(t('Operation Completed Successfully'), t('Your operation will be processed in background'))
    setLoading(false)
  }

  const leftToolBar = () => (
    <>
      {adminPage && <li>
            <Button
                  type="primary"
                  loading={loading}
                  onClick={downloadExcelTemplate}
                  disabled={loading}
                  style={{
                      minWidth: true ? 200 : 170,
                      padding: '0px 5px',
                      marginRight: 20,
                  }}
            >
              {t('Export excel')}
            </Button>
        </li>
        }
    </>
  );

  return (
    <div style={{padding:'25px 10px'}}>
      <Card title={adminPage ? t('Notification Subscriptions') : ""}>
        {!adminPage && (
          <Row gutter={0}>
            <Col span={16}>
              <ContentHeader showBack showBackLink={"/"} title={t('Notification Subscriptions')} />
            </Col>
          </Row>)
          }
            <Row align="middle" justify="space-between">
              <div style={{ width: '100%', margin: '0 5px', overflow: 'hidden' }}>
                <TableView
                  canDelete={!adminPage}
                  onDeleteRow={!adminPage ? (record: any) => currentStore.delete(record.id) : null}
                  canCreateNew={!adminPage}
                  canSelect={!adminPage}
                  leftToolbar={leftToolBar()}
                  onNewItem={() => setShowCreationModal(true)}
                  rowKey="id"
                  initPagination={false}
                  onQueryChanged={async (q: Query) => {
                    setQuery(q);
                    await currentStore.load(q)
                  }}
                  onRefresh={async () => await currentStore.load(query)}
                  model={notificationTableModel}
                  error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
                />
                {showCreationModal && (
                  <NotificationSubscritionUpsertionModal loadFromStore={open} formTitle={t('Create new Subscription')} onClose={onModalClose}/>
                )}
                {showEditModal && (
                  <NotificationSubscritionUpsertionModal
                    adminPage={adminPage}
                    notificationSubscriptionId={selectedNotificationId}
                    formTitle={t('Edit Subscription')}
                    onClose={onModalClose}
                  />
                )}
              </div>
            </Row>
      </Card>
    </div>
  )
}

export default withCache(withTranslation()(withRouter(NotificationSubscriptionHome)))
