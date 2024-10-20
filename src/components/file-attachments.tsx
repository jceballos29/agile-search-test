import React, { FC, useEffect, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { FileAttachmentGrantSummaryStore } from '../stores/grant-store';
import { container } from '../inversify.config';
import { Alert, message, Modal, Pagination, Select, Spin, Tag } from 'antd';
import { FileOutlined, InboxOutlined, PaperClipOutlined } from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import { IdentityProps } from '../core/services/authentication';
import i18n from '../i18n';
import HttpService from '../core/services/http.service';
import { getFileTypes } from 'src/utils/docTypes'

interface FileAttachmentsProps extends WithTranslation, IdentityProps {
    grantId: string;
    onChangeListFiles?: () => void;
}

const FileAttachmentsSelectorView: FC<FileAttachmentsProps> = (props) => {
    const { t, identity, grantId, onChangeListFiles } = props;

    const [uploadedFile, setUploadedFile] = useState<any>([]);
    const isBusy = false;
    const [nameConflict, setNameConflict] = useState<string[]>([]);
    const [nameConflictResolve, setNameConflictResolve] = useState<any[]>([]);
    const [nameConflictReject, setNameConflictReject] = useState<any[]>([]);
    const [noConflictFilesCount, setNoConflictFilesCount] = useState<number>(0);
    const [showConflicts, setShowConflicts] = useState(false);
    const [docType, setDocType] = useState('Resumen');
    const httpService = container.get(HttpService);
    const [currentPage, setCurrentPage] = useState(1);

    const fileTypes = getFileTypes(t, false);

    const currentFileStore = container.get(FileAttachmentGrantSummaryStore);
    const currentFileState = currentFileStore.state;
    const currentFileQueries = {
        searchQuery: '',
        skip: 0,
        take: 10,
        parameters: { key: '', documentType: [] },
    };

    useEffect(() => {
        loadFiles(currentPage);
    }, [docType, grantId])

    const existFile = async (filename: string) => {
        const result = await httpService
            .get(`api/v1/grantFiles/exists/grant/${grantId}/${filename}`, '');
        return result;
    }

    const beforeUpload = (file: any, fileList: any[]) => {
        return new Promise<void>(async (resolve, reject) => {
            const alreadyExists: any = await existFile(file.name);
            const isLastFile = fileList[fileList.length - 1].name === file.name;
            const conflicts = nameConflict;
            const currentResolve = nameConflictResolve;
            const currentReject = nameConflictReject;

            if (alreadyExists.data.exists) {
                const matchingFileType = fileTypes.find(fileType => fileType.documentTypes.includes(alreadyExists.data.docType));
                const docType = matchingFileType !== undefined ? matchingFileType.label : t('Other Documents');

                conflicts.push(`${t(docType)} ${file.name}`);
                currentResolve.push(resolve);
                currentReject.push(reject);
            } else {
                resolve();
            }
            if (isLastFile && conflicts.length > 0) {
                setNameConflict(conflicts);
                setShowConflicts(true);
                setNoConflictFilesCount(fileList.length - conflicts.length);
                setNameConflictReject(nameConflictReject);
                setNameConflictResolve(nameConflictResolve);
            }
        });
    };

    const process = (file) => {
        let list = uploadedFile;
        if (file.status === 'uploading') {
            if (!uploadedFile.any((t) => t.uid === file.uid)) list.push(file);
        } else {
            list = list.filter((t) => t.uid !== file.uid);
        }
        setUploadedFile(list);
    };

    const propsDragger = {
        name: 'file',
        multiple: true,
        fileList: uploadedFile,
        beforeUpload: beforeUpload,
        action: `api/v1/grantFiles/upload/${docType}/${grantId}?access_token=${identity.accessToken}`,
        onChange: function (info) {
            const { status } = info.file;
            if (status !== 'uploading') {
            }
            if (status === 'done') {
                message.success(`${info.file.name} ${t('File Uploaded Successfully')}.`);
                loadFiles(currentPage);
                if (onChangeListFiles) onChangeListFiles();
            } else if (status === 'error') {
                message.error(`${info.file.name} ${t('File Upload Fail')}.`);
            }
            process(info.file);
        },
    };

    const onAction = (action: 'overwrite' | 'abort') => {
        if (action === 'overwrite') {
            nameConflictResolve.forEach((resolver) => resolver());
        } else {
            nameConflictReject.forEach((rejecter) => rejecter());
        }
        setNameConflict([]);
        setNameConflictReject([]);
        setNameConflictResolve([]);
        setNoConflictFilesCount(0);
        setShowConflicts(false);
    };

    const remove = async (name: string) => {
        await httpService
            .post(`api/v1/grantFiles/delete/${grantId}/${name}`, '')
            .then((result) => console.log(result))
            .finally(() => {
                message.success(`${t('File Delete Successfully')}.`);
            });
        setCurrentPage(1);
        loadFiles(1);
        if (onChangeListFiles) onChangeListFiles();
    };

    const setDocumentType = (value: any) => {
        switch (value) {
            case 0:
                setDocType('Resumen');
                break;
            case 1:
                setDocType('FAQs');
                break;
            case 2:
                setDocType('Presentaciones');
                break;
            case 3:
                setDocType('Plantillas solicitud');
                break;
            case 4:
                setDocType('Plantillas justificación');
                break;
            case 5:
                setDocType('Convocatoria');
                break;
            case 6:
                setDocType('Bases reguladoras');
                break;
            case 7:
                setDocType('Modificaciones');
                break;
            case 8:
                setDocType('Resoluciones');
                break;
        }
    };

    const getDocumentTypeKey = (value: any) => {
        switch (value) {
            case 'Resumen':
                return 'Summary';
            case 'FAQs':
                return 'Faqs';
            case 'Presentaciones':
                return 'Presentation';
            case 'Plantillas solicitud':
                return 'Request';
            case 'Plantillas justificación':
                return 'Justification';
            case 'Convocatoria':
                return 'Call';
            case 'Bases reguladoras':
                return 'RegulatoryBase';
            case 'Modificaciones':
                return 'Modification';
            case 'Resoluciones':
                return 'Resolution';
        }
    };

    const onChangePage = (newpage: number) => {
        if (newpage !== currentPage) {
            setCurrentPage(newpage);
            loadFiles(newpage);
        }
    };

    const loadFiles = (page: number) => {
        const key = getDocumentTypeKey(docType);
        const parameter = fileTypes.filter((file) => file.key === key)[0].documentTypes
        currentFileQueries.parameters = { key: key, documentType: parameter }
        currentFileQueries.skip = (page - 1) * 10
        currentFileStore.getAll(Number(grantId), currentFileQueries)
    }

    return (
        <div className={'attachment-list'} style={{ paddingBottom: '10px' }}>
            <div style={{ paddingBottom: 20 }}>
                <Select
                    size={'middle'}
                    defaultValue={0}
                    style={{ width: 200 }}
                    onChange={(value1) => setDocumentType(value1)}
                    options={[
                        {
                            label: t('Tools'),
                            options: [
                                { label: i18n.language === 'es' ? 'Resumen' : t('Resumen'), key: 'Resumen', value: 0 },
                                { label: i18n.language === 'es' ? 'FAQs' : t('FAQs'), key: 'FAQs', value: 1 },
                                { label: i18n.language === 'es' ? 'Presentaciones' : t('Presentaciones'), key: 'Presentaciones', value: 2 },
                                { label: i18n.language === 'es' ? 'Plantillas solicitud' : t('Plantillas solicitud'), key: 'Plantillas solicitud', value: 3 },
                                { label: i18n.language === 'es' ? 'Plantillas justificación' : t('Plantillas justificación'), key: 'Plantillas justificación', value: 4 }
                            ]
                        },
                        {
                            label: t('Regulations'),
                            options: [
                                { label: i18n.language === 'es' ? 'Convocatoria' : t('Convocatoria'), key: 'Convocatoria', value: 5 },
                                { label: i18n.language === 'es' ? 'Bases reguladoras' : t('Bases reguladoras'), key: 'Bases reguladoras', value: 6 },
                                { label: i18n.language === 'es' ? 'Modificaciones' : t('Modificaciones'), key: 'Modificaciones', value: 7 },
                                { label: i18n.language === 'es' ? 'Resoluciones' : t('Resoluciones'), key: 'Resoluciones', value: 8 }
                            ]
                        }
                    ]}
                >
                </Select>
            </div>

            <Spin spinning={isBusy || currentFileState.isBusy.get()} style={{ paddingTop: 20 }}>
                <Dragger {...propsDragger} style={{ paddingTop: 20 }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t('Click or drag a file to this area to upload')}</p>
                </Dragger>
                <div style={{ marginTop: 10 }}>
                    {currentFileState.items.get().map((c) => (
                        <Tag closable onClose={async () => await remove(c.fileName)} key={c.fileName}>
                            <PaperClipOutlined />
                            {c.fileName}
                        </Tag>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <Pagination
                        simple
                        hideOnSinglePage
                        showSizeChanger
                        showQuickJumper
                        current={currentPage}
                        total={currentFileState.count.get()}
                        showTotal={(total: number) => `${total} ${t("Documents").toLowerCase()}`}
                        onChange={(pageNumber) => onChangePage(pageNumber)}
                    />
                </div>
                <Modal
                    maskClosable={false}
                    visible={showConflicts}
                    cancelText={t('Overwrite')}
                    onCancel={() => onAction('overwrite')}
                    onOk={() => onAction('abort')}
                    closable={false}
                    title={t('Name conflict')}
                    okText={t('Abort')}
                >
                    <Alert message={t('Name conflict occurred with the following files')} type={'warning'} />
                    <ul className={'file-list'} style={{ marginTop: '10px' }}>
                        {nameConflict.map((conflict) => (
                            <p style={{ marginLeft: '5px' }}>
                                <FileOutlined style={{ marginRight: 5 }} />
                                {conflict}
                            </p>
                        ))}
                    </ul>
                    {noConflictFilesCount > 0 && <p>* {t('The rest of the files will be uploaded automatically')}</p>}
                </Modal>
            </Spin>
        </div>
    );
};

export default withTranslation()(FileAttachmentsSelectorView);
