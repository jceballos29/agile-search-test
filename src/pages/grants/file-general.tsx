import { Col, Row, Collapse, Spin, Pagination } from 'antd';
import { FC, useEffect, useState, useMemo } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { container } from 'src/inversify.config';
import { FileGrantSummaryStore } from 'src/stores/grant-store'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import { getFileTypes } from '../../utils/docTypes';
import HttpService from 'src/core/services/http.service';
import { StatisticsEventType } from 'src/utils/enums/enumStatisticsEventType';

const { Panel } = Collapse;

interface FileGeneralDetailProps extends WithTranslation, RouteComponentProps, IdentityProps, UserProfileProps {
    grantId: string
    fileKeys: string[]
    reload?: boolean;
}

const FileGeneralDetail: FC<FileGeneralDetailProps> = (props) => {
    const { t, grantId, fileKeys } = props;
    const isGlobalRole = (props.identity.roles || []).some((role) =>
        ['Admin', 'Manager', 'Consultor', 'Consultant', 'Viewer'].some((adminRole) => role.includes(adminRole))
    );
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeKey, setActiveKey] = useState<string | undefined>(undefined);

    const httpService = container.get(HttpService)

    const fileTypes = getFileTypes(t, true);

    const fileTypesAccess = fileTypes.filter(fileType => fileKeys.includes(fileType.key))

    const currentFileStore = container.get(FileGrantSummaryStore);
    const currentFileState = currentFileStore.state;
    const currentFileQueries = {
        searchQuery: '',
        skip: 0,
        take: 10,
        parameters: { key: '', documentType: [] },
    };

    useEffect(() => {
        setIsLoading(false)
        setActiveKey(undefined)
        setCurrentPage(1)
        currentFileQueries.searchQuery = ''
        currentFileQueries.skip = 0
        currentFileQueries.take = 10
        currentFileQueries.parameters = { key: '', documentType: [] }
    }, [grantId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (activeKey !== undefined) {
            memoizedLoadFiles(activeKey as string);
        }
        setCurrentPage(1)
        currentFileQueries.skip = 0
    }, [activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (currentFileStore.activeKey !== activeKey) setActiveKey(undefined)
    }, [currentFileStore.activeKey, activeKey])

    useEffect(() => {
        setActiveKey(undefined);
    }, [props.reload])

    const memoizedLoadFiles = useMemo(() => {
        return async (key: string) => {
            const parameter = fileTypes.filter((file) => file.key === key)[0].documentTypes
            currentFileQueries.parameters = { key: key, documentType: parameter }
            setIsLoading(true);
            await currentFileStore.getAll(Number(grantId), currentFileQueries, activeKey)
                .then(() => {
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                })

        };
    }, [grantId, t, currentFileQueries]); // eslint-disable-line react-hooks/exhaustive-deps

    const onChangeKey = (key: string | string[] | undefined) => {
        setActiveKey(key as string);
    };

    const onChangePage = (newpage: number) => {
        if (newpage !== currentPage) {
            setCurrentPage(newpage)
            currentFileQueries.skip = (newpage - 1) * 10
            memoizedLoadFiles(activeKey)
        }
    };

    const verifyTypeFile = (value: string) => {
        value = value.toLowerCase()
        if (value.endsWith(".pdf"))
            return <i className="fa-solid fa-file-powerpoint" style={{ color: "#AF1007" }}></i >
        if (value.endsWith(".doc") || value.endsWith(".docx"))
            return <i className="fa-solid fa-file-word" style={{ color: "#2B569A" }}> </i>
        if (value.endsWith(".xlsx"))
            return <i className="fa-solid fa-file-excel" style={{ color: "green" }}> </i >
        if (value.endsWith(".ppt") || value.endsWith(".pptx"))
            return <i className="fa-solid fa-file-powerpoint" style={{ color: "#FF8D0A" }}> </i>
        if (value.endsWith(".jpg") || value.endsWith(".png"))
            return <i className="fa-solid fa-image" style={{ color: "#2B569A" }}> </i>
        else return <i className="fa-solid fa-file-zipper" style={{ color: "#F5D471" }}> </i >
    }

    const AddEventDocumentLog = async (url: any, documentType: string) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = url;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        const matchingFileType = fileTypes.find(fileType => fileType.documentTypes.includes(documentType))
        let eventType;

        switch (matchingFileType.key) {
            case ("Summary"):
                eventType = StatisticsEventType.DocumentSummary; break;
            case ("Presentation"):
                eventType = StatisticsEventType.DocumentPresentation; break;
            case ("Justification"):
                eventType = StatisticsEventType.DocumentJustification; break;
            case ("Request"):
                eventType = StatisticsEventType.DocumentRequest; break;
            case ("Faqs"):
                eventType = StatisticsEventType.DocumentFaqs; break;
            case ("Call"):
                eventType = StatisticsEventType.DocumentCall; break;
            case ("RegulatoryBase"):
                eventType = StatisticsEventType.DocumentRegulatoryBase; break;
            case ("Modification"):
                eventType = StatisticsEventType.DocumentModification; break;
            case ("Resolution"):
                eventType = StatisticsEventType.DocumentResolution; break;
            default: break;
        }

        await httpService.post(`api/v1/statistics/AddEventLog/${grantId}`, {
            grantId: grantId,
            EventType: eventType.toString()
        })
    }

    return (
        isGlobalRole && (
            <Spin spinning={isLoading} size="large">
                <Collapse accordion ghost onChange={onChangeKey} activeKey={activeKey} style={{ fontSize: 'large' }}>
                    {fileTypesAccess.map((type) => (
                        <Panel key={type.key} header={<strong style={{ color: "#5f5c5d" }}><i className="fa-solid"></i>{type.label}</strong>}>
                            <Col span={24} style={{ fontSize: 'smaller' }} >
                                {currentFileState.items.get().map((doc) => (
                                    <Row key={doc.id} className="mini-card-document">
                                        {verifyTypeFile(doc.url)}
                                        <a href="#" onClick={() => AddEventDocumentLog(doc.url, doc.documentType)} target="_blank">{doc.fileName}</a>
                                    </Row>
                                ))}
                            </Col>
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
                        </Panel>
                    ))}
                </Collapse>
            </Spin>
        )
    );
};

export default withIdentity(withUserProfile((withTranslation()(withRouter(FileGeneralDetail)))))
