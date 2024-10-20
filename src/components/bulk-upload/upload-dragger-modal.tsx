import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { Button, Spin, Upload, Select } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import FileSaver from 'file-saver';
import React, { FC, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import HttpService from 'src/core/services/http.service';
import { container } from 'src/inversify.config';
import { ImportResult } from './types';

const { Option } = Select

interface UploadDraggerModalProps extends WithTranslation, IdentityProps {
  visible: boolean;
  bulkInsertUrl: string;
  bulkInsertTemplateUrl: string;
  bulkInsertTemplateName: string;
  modalName: string;
  onUploadComplete?: (response: ImportResult) => void;
  onCancel: () => void;
}

const UploadDraggerModal: FC<UploadDraggerModalProps> = (props) => {
  const { modalName, visible, bulkInsertUrl, bulkInsertTemplateUrl, bulkInsertTemplateName, onUploadComplete, onCancel, t } = props;

  const [isBusy, setIsBusy] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setUploadingError] = useState<string[] | null>(null);
  const [filterByEdit, setFilterByEdit] = useState([])


  const handleOnChange = (info: any) => {
    setIsBusy(false);
    setUploadingError(null);
    switch (info.file.status) {
      case 'uploading':
        setIsBusy(true);
        break;
      case 'error':
        const errors = getUploadErrors(info);
        if (errors) {
          setUploadingError(errors);
        }
        onCancel();
        break;
      case 'done':
        onUploadComplete?.(info.file.response);
        break;
      default:
        break;
    }
  };

  const getUploadErrors = (info: any) => {
    // TODO: Handle all ways to get upload errors
    if (info.file.response && info.file.response.messages && info.file.response.messages.length > 0) {
      // if (!info.file.response.error) return info.file.response;
      return info.file.response.error ? info.file.response.error.message : info.file.response.messages.map((i: any) => i.body);
    }
    return ['Upload Error'];
  };

  const handleClickOnDownloadImportTemplate = async () => {
    setIsBusy(true);
    let httpService = container.get(HttpService);
    const result = await httpService.get(bulkInsertTemplateUrl, {
      responseType: 'arraybuffer',
    });
    setIsBusy(false);
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, `${bulkInsertTemplateName}.xlsx`);
  };

  const renderDownloadTemplate = () => (
    <>
      <h4>{t('Import template')}</h4>
      <h5 style={{ marginTop: '4px' }}>{t('Use an Excel template to easily import your data')}</h5>
      <Button block color={'#40a9ff'} onClick={handleClickOnDownloadImportTemplate}>
        <DownloadOutlined />
        {t('Download import template')}
      </Button>
    </>
  );

  const handleChangeFilterByEdit = (value: string[]) => {
    setFilterByEdit(value)
  };

  return (
    <Modal title={modalName} okButtonProps={{ style: { display: 'none' } }} closable onCancel={onCancel} cancelText={t('Cancel')} visible={visible}>
      <Spin spinning={isBusy}>
        <div style={{ marginBottom: '15px' }}>{renderDownloadTemplate()}</div>
        <h5>{t('We help you import your information in an agile way')}</h5>
        {
          modalName === 'Bulk Edit Grants' ? 
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%', marginBottom: '10px' }}
              placeholder="Filter by edit"
              onChange={handleChangeFilterByEdit}
            >
              <Option key={'HatContact'} value={'hatContact'}>{t('HatContact')}</Option>
              <Option key={'HatContact2'} value={'hatContact2'}>{t('HatContact2')}</Option>
              <Option key={'Mirror 1'} value={'mirror1'}>{t('Mirror 1')}</Option>
              <Option key={'Mirror 2'} value={'mirror2'}>{t('Mirror 2')}</Option>
              <Option key={'Mirror 3'} value={'mirror3'}>{t('Mirror 3')}</Option>
              <Option key={'Mirror 4'} value={'mirror4'}>{t('Mirror 4')}</Option>
              <Option key={'Projects Group'} value={'projectsGroup'}>{t('Projects Group')}</Option>
              <Option key={'Typology'} value={'typology'}>{t('Typology')}</Option>
              <Option key={'Sectors'} value={'sectors'}>{t('Sectors')}</Option>
              <Option key={'Target Sector'} value={'targetSector'}>{t('Target Sector')}</Option>
              <Option key={'BDNS'} value={'bdns'}>{t('BDNS')}</Option>
            </Select>
            : null
        }
        
        <Upload.Dragger
          name={'file'}
          headers={{
            authorization: `Bearer ${HttpService.accessToken}`,
            language: `${HttpService.language}`,
          }}
          showUploadList={false}
          action={bulkInsertUrl}
          data={modalName === 'Bulk Edit Grants' ? { filter: filterByEdit } : null}
          onChange={(value) => handleOnChange(value)}
        >
          <p className="ant-upload-text">{t('Click or drag file to this area to upload')}</p>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
        </Upload.Dragger>
      </Spin>
    </Modal>
  );
};

export default withIdentity(withTranslation()(UploadDraggerModal));
