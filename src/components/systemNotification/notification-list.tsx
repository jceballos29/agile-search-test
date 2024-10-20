import { Badge, Spin, Pagination, Table } from 'antd';
import  { FC, useEffect, useState } from 'react';
import { container } from 'src/inversify.config';
import { NotificationItem, NotificationItemStore } from 'src/stores/systemNotifications/notification-store';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Query } from '../../core/stores/data-store';
import NotificationView from './notification-Item';
import 'react-sortable-tree/style.css';

export interface NotificationListProps extends WithTranslation {
  reload: number;
  setNotificationCount: (count: number) => void;
  visible: boolean;
}

const NotificationList: FC<NotificationListProps> = ({ t, reload, setNotificationCount, visible }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [query] = useState({
    searchQuery: '',
    orderBy: [{ field: 'creationTime', direction: 'Descending', useProfile: false }],
    skip: 0,
    take: 50
  } as Query);
  const [wasOpen, setWasOpen] = useState(-1);
  const notificationStore = container.get<NotificationItemStore>(NotificationItemStore);
  const notificationState = notificationStore.state;

  useEffect(() => {
    if (reload > 0) load();    
  }, [reload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (visible) {
      setWasOpen(1);
    } else {
      if (wasOpen > 0) {
        setNotificationReadStatus();
      } else {
        load();
      }
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const setNotificationReadStatus = async () => {
    await notificationStore.SetReadStatus();
    await load();
  };

  const load = async () => {
    await notificationStore.load(query);
    setNotificationCount(notificationState.items.get().filter((x) => !x.readed).length);  
  };

  const remove = async (not: NotificationItem) => {
    await notificationStore.delete(not.id);
    await load();
  };

  const clear = async () => {
    await notificationStore.deleteAll();
    await load();
  };

  if (!notificationState.count.get() || notificationState.count.get() === 0) {
    return <h2>{t('No Notifications')}</h2>;
  }

  //Pagination
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = notificationState.items.get().slice(startIndex, endIndex);  

  return (
    <div data-testid="openNotificationsButton" className="notification-content"
      style={{ marginRight: '20px' }}
    >
      <Spin spinning={notificationState.isBusy.get()}>
        <Badge count={notificationState.items.get().filter((x) => !x.readed).length}>
          <h2>{t('Notifications')}</h2>
        </Badge>
        <span style={{ fontSize: '16px', marginLeft: '10px' }}>{'(' + notificationState.count.get() + ')'} </span>
        <button type='button' className='ant-btn ant-btn-default' style={{ float: 'right' }} onClick={clear}> {t('Clear All')} </button>

        <Pagination
          current={currentPage}
          total={notificationState.items.get().length}
          pageSize={itemsPerPage}
          onChange={(page) => setCurrentPage(page)}
        />

        {currentData.map((x) => (
          <NotificationView key={x.id} notification={x} removeNotification={() => remove(x)} />
        ))}
        
      </Spin>
    </div>


  );
};

export default withTranslation()(NotificationList);
