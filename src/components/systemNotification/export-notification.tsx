import React, { FC } from 'react';
import { Alert, Button } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next';
import { NotificationItem } from 'src/stores/systemNotifications/notification-store';

interface Props extends WithTranslation {
  title: string;
  notification: NotificationItem;
  fileName: string;
  downloadExcel: (data: any, fileName: string) => void;
}

const ExportNotification: FC<Props> = ({ title, notification, downloadExcel, fileName, t }) => {
  return (
    <>
      {notification && !notification.data.MessageError && (
        <>
          <Alert message={t(title)} banner type="info" showIcon />
          <Button
            onClick={() => {
              downloadExcel(notification.data, fileName);
            }}
          >
            {t('Download File')}
          </Button>
        </>
      )}
      {notification && notification.data.MessageError && <Alert message={notification.data.MessageError} banner type="error" showIcon />}
    </>
  );
};

export default withTranslation()(ExportNotification);
