import React, { FC, useState } from 'react';
import { Alert, Button, Modal } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next';
import BulkInsertResultsSummary from 'src/components/bulk-upload/bulk-insert-result-summary';
import { ImportResult } from 'src/core/ui/collections/table';
import { NotificationItem } from '../../stores/systemNotifications/notification-store';

interface Props extends WithTranslation {
  notification: NotificationItem;
}

const BulkInsertNotificationSummary: FC<Props> = ({ notification, t }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const openNotification = () => {
    setIsOpen(true);
  };

  const renderResultsDetailModal = () => (
    <Modal
      visible={isOpen}
      closable={true}
      onOk={() => setIsOpen(false)}
      onCancel={() => setIsOpen(false)}
      okText={t('Ok')}
      cancelButtonProps={{ hidden: true }}
      title={t('Upload complete')}
    >
      <BulkInsertResultsSummary
        importResult={
          {
            success: notification.data.Success,
            errors: notification.data.Errors?.map((item: any) => ({ row: item.Row, reason: item.Reason })) ?? [],
            importedElements: notification.data.ImportedElements,
            totalElements: notification.data.TotalElements,
            warnings: notification.data.Warnings?.map((item: any) => ({ row: item.Row, reason: item.Reason })) ?? [],
          } as ImportResult
        }
      />
    </Modal>
  );

  return (
    <>
      {notification && notification.data.ImportedElements !== undefined && (
        <>
          <Alert message={`${t('Total elements')} : ${notification.data.TotalElements}`} banner type="info" showIcon />
          <Alert
            message={<div data-testid="totalImported">{`${t('Total imported')} : ${notification.data.ImportedElements}`}</div>}
            banner
            type="info"
            showIcon
          />
        </>
      )}
      {notification && notification.data.messageError && (
        <>
          <Alert message={t(notification.data.messageError)} banner type="error" showIcon />
        </>
      )}
      {notification && notification.data.Errors && notification.data.Errors.length > 0 && (
        <>
          <Alert message={`${t('Errors')} : ${notification.data.Errors.length}`} banner type="error" />
        </>
      )}

      {notification && notification.data.Warnings && notification.data.Warnings.length > 0 && (
        <>
          <Alert message={`${t('Warnings')} : ${notification.data.Warnings.length}`} banner type="warning" />
        </>
      )}
      {notification && notification.data.ImportedElements !== undefined && (
        <Button
          onClick={() => {
            openNotification();
          }}
        >
          {t('Open Result')}
        </Button>
      )}
      {isOpen && renderResultsDetailModal()}
    </>
  );
};

export default withTranslation()(BulkInsertNotificationSummary);
