import { HeartTwoTone, HeartOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Alert, Col, Row, Spin, Tooltip } from 'antd';
import { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import ContentHeader from 'src/core/ui/content-header';
import { container } from 'src/inversify.config';
import { GrantItem, FileTypeGrantSummaryStore } from 'src/stores/grant-store';
import GrantPlDetail from 'src/pages/grants/grant-pl';
import GrantGeneralDetail from 'src/pages/grants/grant-general';
import HttpService from '../../core/services/http.service';
import { getFileTypes } from '../../utils/docTypes';
import FileSaver from 'file-saver';

interface GrantDetailProps extends WithTranslation, RouteComponentProps, IdentityProps {
    grantId: string;
}

const GrantDetail: FC<GrantDetailProps> = (props) => {
    const { t, match, identity } = props;
    const [isBusy, setIsBusy] = useState(true)
    const grantId = (match.params as any)['grantId'] as string;
    const [grant, setGrant] = useState<GrantItem>();
    const httpService = container.get(HttpService);
    const [language, setLenguage] = useState(HttpService.language);
    const [favorite, setFavorite] = useState<boolean>(grant?.isFavorite ?? false);
    const [idCardDownload, setIdCardDownload] = useState(false);
    const currentFileTypeStore = container.get(FileTypeGrantSummaryStore);
    const currentFileTypeState = currentFileTypeStore.state;

    const isAdmin = (identity.roles ? identity.roles : [])
    .filter(o =>
      o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant'))?.length > 0;

    const onlyCountryViewer = (identity.roles ? identity.roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

    const isViewer = (props.identity.roles || []).some((role) => role.includes("Viewer"))
    const allowedFileTypesForViewer = ['Summary', 'Call', 'RegulatoryBase', 'Modification', 'Resolution'];

    const fileTypes = getFileTypes(t, false);

    useEffect(() => {
        load(grantId);
    }, [grantId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (language != HttpService.language) {
            setLenguage(HttpService.language);
            load(grantId);
        }
    }, [t]); // eslint-disable-line react-hooks/exhaustive-deps

    const load = async (id: string) => {
        try {
            const [resultGrant, targetSectors, sectors, locations, typologies, beneficiaryTypes]: any[] = await Promise.all([
                httpService.get(`api/v1/grants/GetGrantTranslate/${Number(id)}`),
                httpService.get(`api/v1/grants/GetGrantTargetSectors/${Number(id)}`),
                httpService.get(`api/v1/grants/GetGrantSectors/${Number(id)}`),
                httpService.get(`api/v1/grants/GetGrantLocations/${Number(id)}`),
                httpService.get(`api/v1/grants/GetGrantTypologies/${Number(id)}`),
                httpService.get(`api/v1/grants/GetGrantBeneficiaryTypes/${Number(id)}`),
            ])
            if (resultGrant && resultGrant.data) {
                if (targetSectors && targetSectors.data) resultGrant.data.targetSectors = targetSectors.data.items;
                if (sectors && sectors.data) resultGrant.data.sectors = sectors.data.items;
                if (locations && locations.data) resultGrant.data.locations = locations.data.items;
                if (typologies && typologies.data) resultGrant.data.typologies = typologies.data.items;
                if (beneficiaryTypes && beneficiaryTypes.data) resultGrant.data.beneficiaryTypes = beneficiaryTypes.data.items;
                setGrant(resultGrant.data);
                setFavorite(resultGrant.data?.isFavorite);
            }
            setIsBusy(false);
        }
        catch (error: any) {
            console.error(error.message);
            setIsBusy(false);
        }
        await currentFileTypeStore.getAll(Number(grantId))
            .then(() => {
                setIsBusy(false);
            })
            .catch((error) => {
                console.error(error.message);
                setIsBusy(false);
            }); 
    };

    const getGrant = () => {
        if (!grant) return <div></div>;

        let allowedFileKeysAccess = [];
        if (isViewer) allowedFileKeysAccess = allowedFileTypesForViewer;
        else allowedFileKeysAccess = fileTypes.map(fileType => fileType.key);

        const finalAllowedFileKeys = currentFileTypeState.items.get().map(type => {
                const matchingFileType = fileTypes.find(fileType => fileType.documentTypes.includes(type));
                return matchingFileType !== undefined && allowedFileKeysAccess.includes(matchingFileType.key) ? matchingFileType.key : 'Other';
            }).filter(key => key !== 'Other' || !isViewer);

        switch (grant.countryId) {            
            case 'Pl':
                return <GrantPlDetail key={grant.id} grant={grant} fileKeys={finalAllowedFileKeys} />;                    
            case 'In':
                switch (grant.externalSystem) {
                    case 'Pl-001':
                        return <GrantPlDetail key={grant.id} grant={grant} fileKeys={finalAllowedFileKeys} />;
                    case 'Pl-002':
                        return <GrantPlDetail key={grant.id} grant={grant} fileKeys={finalAllowedFileKeys} />;
                    default:
                        return <GrantGeneralDetail key={grant.id} grant={grant} fileKeys={finalAllowedFileKeys} />;
                }
        }
        return <GrantGeneralDetail key={grant.id} grant={grant} fileKeys={finalAllowedFileKeys} />;
    };

    const SetFavorite = async () => {
        const result = await httpService.post(`api/v1/grants/favorite/` + grant?.id, {
            isFavorite: !favorite,
        });
        if (result) setFavorite(!favorite);
    };

    const getFavorite = () => {
        if (favorite) {
            return (
                <Tooltip title={t('Remove this Grant of your Favorites')}>
                    {' '}
                    <HeartTwoTone onClick={() => SetFavorite()} style={{ fontSize: '40px', marginRight: 80, cursor: 'pointer' }} twoToneColor="red" />
                </Tooltip>
            );
        }

        return (
            <Tooltip title={t('Add this Grant to your Favorites')}>
                {' '}
                <HeartOutlined onClick={() => SetFavorite()} style={{ fontSize: '40px', marginRight: 80, cursor: 'pointer' }} />
            </Tooltip>
        );
    };

    const handleDownloadIdCard = async (grantId: Number) => {
        setIdCardDownload(true);
        const result = await httpService.get(`api/v1/grants/grantSlide/${grantId}`, {
          responseType: 'arraybuffer'
        })
        const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
        (FileSaver as any).saveAs(blob, `${ grant.title}.pptx` );
        setIdCardDownload(false);
    }

    return (
        <>
            <Spin spinning={isBusy} size={"large"}>
                <Row gutter={0} className="header-container-details">
                    <Col span={20}>
                        <ContentHeader
                            showBack
                            title={
                                grant ? (
                                    <>                                        
                                        {' '}
                                        {grant.title}{' '}
                                    </>
                                ) : (
                                    ''
                                )
                            }
                        />
                    </Col>
                    <Col span={4}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {!onlyCountryViewer ? (
                                <Tooltip title={t('Download ID Card')}>
                                    <Spin spinning={idCardDownload}>
                                        <VerticalAlignBottomOutlined
                                            onClick={() => handleDownloadIdCard(Number(grant.id))}
                                            style={{ fontSize: '40px', cursor: 'pointer', marginRight: 10}}
                                        />
                                    </Spin>
                                </Tooltip>) : <></>}
                            {getFavorite()}
                        </div>
                    </Col>
                </Row>
                {grant === undefined && (
                    <Alert
                        style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                        message={t('No grants found...')}
                        showIcon
                        type="warning"
                    />
                )}
                <Row align="top" justify="space-between">
                    {getGrant()}  
                </Row>
            </Spin>
        </>
    );
};

export default withIdentity(withTranslation()(withRouter(GrantDetail)));
