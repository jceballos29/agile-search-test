import { CloseOutlined, NotificationOutlined } from '@ant-design/icons';
import { Alert, Badge, Card, Spin, Row, Col } from 'antd';
import FileSaver from 'file-saver';
import React, { FC, ReactNode, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import HttpService from '../../core/services/http.service';
import { container } from '../../inversify.config';
import { NotificationItem } from 'src/stores/systemNotifications/notification-store';
import ExportNotification from './export-notification';
import BulkInsertNotification from './bulk-insert-notification';

export enum NotificationType {
  ImportGrants = 'ImportGrants',
  ExportExcel = 'ExportExcel',
  ExportNotificationsExcel = "ExportNotificationsExcel",
  ExportCalendar = 'ExportCalendar',
}

interface Props extends WithTranslation {
  notification: NotificationItem;
  openNotification?: () => void;
  removeNotification?: () => void;
}

const NotificationView: FC<Props> = (props) => {
  const { t, notification } = props;
  const [isBusy, setIsBusy] = useState(false);
  const httpService = container.get(HttpService);

  const downloadExcel = async (data: any, fileName: string) => {
    setIsBusy(true);
    const result = await httpService.get(`api/v1/grants/downloadExcel?url=` + data, {
      responseType: 'arraybuffer',
    });
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, `${t(fileName)}.xlsx`);
    setIsBusy(false);
    };

  const downloadPDF = async (data: any, fileName: string) => {
    setIsBusy(true);
    const result = await httpService.get(`api/v1/grants/downloadPdf?url=` + data, {
      responseType: 'arraybuffer',
    });
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, `${t(fileName)}.pdf`);
    setIsBusy(false);
  };

  const getNotificationContent = (): ReactNode => {

    switch (notification.type) {

      case NotificationType.ImportGrants:
        return <BulkInsertNotification notification={notification} />;

      case NotificationType.ExportExcel:
        return <ExportNotification
          title={t('Exported Grants')}
          fileName={t('Exported Grants')}
          notification={notification}
          downloadExcel={downloadExcel}
        />;

      case NotificationType.ExportNotificationsExcel:
        return <ExportNotification
          title={t('Exported Subscriptions')}
          fileName={t('Exported Subscriptions')}
          notification={notification}
          downloadExcel={downloadExcel}
            />;

        case NotificationType.ExportCalendar:
            return <ExportNotification
                title={t('Export Calendar')}
                fileName={t('Export Calendar')}
                notification={notification}
                downloadExcel={downloadPDF}
            />;
    }

    return <>{notification.type}</>;
  };

  return (
    <div className="notification-item">
      <Spin spinning={isBusy}>
        <Card
          title={
            <Row style={{ flexFlow: 'row' }}>
              <Col flex="none">
                <span style={{ marginRight: '10px' }}>
                  <Badge count={notification.readed ? 0 : undefined} dot>
                    <NotificationOutlined />
                  </Badge>
                </span>
              </Col>
              <Col flex="auto">
                <div style={{ whiteSpace: 'normal' }}>{t(notification.description)}</div>
              </Col>
            </Row>
          }
          extra={
            <CloseOutlined
              onClick={() => {
                if (props.removeNotification) props.removeNotification();
              }}
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
            />
          }
        >
          {getNotificationContent()}
        </Card>
      </Spin>
    </div>
  );
};

export default withTranslation()(NotificationView);
