import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import { successNotification } from 'src/components/systemNotification/notificationService';
import { ImportResult } from 'src/core/ui/collections/table';
import BulkInsertResultsSummary from './bulk-insert-result-summary';
import UploadDraggerModal from './upload-dragger-modal';
import { WithTranslation, withTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  onBulkUploadComplete?: () => void;
  onBulkUploadCancel?: () => void;
  uploadModalOpen: boolean;
  setUploadModalOpen: (value: boolean) => void;
  modalName?: string;
  bulkInsertTemplateName?: string;
  bulkInsertUrl?: string;
  bulkInsertTemplateUrl?: string;
  hideUploadResult?: boolean;
}

const UploadModal: FC<Props> = (props: Props) => {
  const {
    onBulkUploadComplete,
    onBulkUploadCancel,
    uploadModalOpen,
    setUploadModalOpen,
    modalName,
    bulkInsertTemplateName,
    bulkInsertUrl,
    bulkInsertTemplateUrl,
    hideUploadResult,
    t,
  } = props;

  const [importResult, setImportResult] = useState<ImportResult | undefined>(undefined);
  const [uploadCompleteModalOpen, setUploadCompleteModalOpen] = useState<boolean>(false);

  const onDoneImporting = () => {
    closeModals();
    setUploadModalOpen(false);
    onBulkUploadCancel?.();
  };

  const onUploadComplete = (response: ImportResult) => {
    setImportResult(response);
    setUploadModalOpen(false);
    if (!hideUploadResult) {
      setUploadCompleteModalOpen(true);
    }
    successNotification(t('Upload Successful'), t('This file will be processed in the background'));
    onBulkUploadComplete?.();
  };

  const renderCompleteModal = () => (
    <Modal
      visible={uploadCompleteModalOpen}
      closable
      onOk={onDoneImporting}
      okText={t('Ok')}
      cancelButtonProps={{ hidden: true }}
      title={t('Upload complete')}
    >
      <BulkInsertResultsSummary importResult={importResult} />
    </Modal>
  );

  const closeModals = () => {
    setUploadCompleteModalOpen(false);
    setUploadModalOpen(false);
  };

  return (
    <>
      {uploadModalOpen && (
        <UploadDraggerModal
          modalName={modalName}
          visible={uploadModalOpen}
          bulkInsertTemplateName={bulkInsertTemplateName}
          bulkInsertTemplateUrl={bulkInsertTemplateUrl}
          bulkInsertUrl={bulkInsertUrl}
          onUploadComplete={onUploadComplete}
          onCancel={closeModals}
        />
      )}
      {uploadCompleteModalOpen && renderCompleteModal()}
    </>
  );
};

export default withTranslation()(UploadModal);
