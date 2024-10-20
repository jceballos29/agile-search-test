import { Button } from 'antd';
import React, { FC, useState } from 'react';
import UploadModal from './upload-modal';

interface Props {
  modalName?: string;
  bulkInsertTemplateName?: string;
  bulkInsertUrl?: string;
  bulkInsertTemplateUrl?: string;
  onBulkUploadComplete?: () => void;
  onBulkUploadCancel?: () => void;
  hideUploadResult: boolean;
  title: string;
}

const BulkUploadButton: FC<Props> = (props: Props) => {
  const {
    onBulkUploadCancel,
    title,
    onBulkUploadComplete,
    modalName,
    bulkInsertTemplateName,
    bulkInsertUrl,
    bulkInsertTemplateUrl,
    hideUploadResult,
  } = props;
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setUploadModalOpen(true)}>{title}</Button>
      <UploadModal
        onBulkUploadComplete={() => onBulkUploadComplete?.()}
        onBulkUploadCancel={() => onBulkUploadCancel?.()}
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        modalName={modalName}
        bulkInsertTemplateName={bulkInsertTemplateName}
        bulkInsertTemplateUrl={bulkInsertTemplateUrl}
        bulkInsertUrl={bulkInsertUrl}
        hideUploadResult={hideUploadResult}
      />
    </>
  );
};

export default BulkUploadButton;
