import {
    FireOutlined,
} from '@ant-design/icons';
import { Button, Col, Row, Tabs } from 'antd';
import React, { FC, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ContentHeader from 'src/core/ui/content-header';
import { CacheProps, withCache } from '../../core/services/cache.service';
import DimensionMapHome from './mappers';
import ConfigSettingHome from './settings';
import FeaturedGrants from './featuredGrants';
import { IdentityProps, withIdentity } from '../../core/services/authentication';
import PublicationControl from '../admin/publication-control/publicationControl';
import CountriesSetting from '../admin/countries-settings/countriesSettings';
import BinControl from '../admin/bin-control/bin';
import FeaturedMessages from './featured-messages/featured-messages-index';
import NotificationSubscriptionHome from '../subscription/index';
import { UserProfileProps, withUserProfile } from '../../components/user-profile';
import WhatsNewTab from './WhatsNew/whatsNewTab'
import StatisticsIndex from './statistics-panel/StatisticsIndex';
const { TabPane } = Tabs;

interface AdminHomeProps extends WithTranslation, RouteComponentProps, UserProfileProps, CacheProps, IdentityProps { }

const AdminHome: FC<AdminHomeProps> = (props) => {
    const [reloadTabPublication, setReloadTabPublication] = useState(true);
    const [reloadTabBin, setReloadTabBin] = useState(false);

    const activate = (key, event) => {

        if (key == '1') {
            setReloadTabPublication(!reloadTabPublication)
        }
        if (key == '6') {
            setReloadTabBin(!reloadTabBin)
        }
    }

    const isGrantAdmin = props.identity.roles && props.identity.roles.length > 0 && props.identity.roles.includes("GrantAdmin");

    return (
        <div style={{ padding: '25px 10px' }}>
            <Row gutter={0}>
                <Col span={16}>
                    <ContentHeader showBack title={props.t('Admin Settings')} />
                </Col>
                {props.userProfile.isFullAdmin && isGrantAdmin &&
                    <Col span={8}>
                        <Button
                            style={{
                                float: 'right',
                            }}
                            icon={<FireOutlined />}
                            onClick={() => window.open(`${process.env.PUBLIC_URL}/hangfire?access_token=${props.identity.accessToken}`, '_blank')}
                        >
                            {props.t('Hangfire Dashboard')}
                        </Button>
                    </Col>
                }
            </Row>
            <Row align="middle" justify="space-between">
                <div style={{ width: '100%', margin: '0 5px', overflow: 'hidden' }}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Tabs defaultActiveKey="1" tabPosition={'top'} onTabClick={activate} style={{ marginLeft: 10 }}>
                                <TabPane tab={props.t('Publication Control')} key={1}>
                                    <PublicationControl identity={props.identity} reloadTab={reloadTabPublication} />
                                </TabPane>
                                {props.userProfile.isFullAdmin && isGrantAdmin ?
                                    <>
                                        <TabPane tab={props.t('Dimension Mappers')} key={2}>
                                            <DimensionMapHome />
                                        </TabPane>
                                        <TabPane tab={props.t('Settings')} key={3}>
                                            <ConfigSettingHome />
                                        </TabPane>
                                    </> : <></>}

                                <TabPane tab={props.t('Featured Grants')} key={4}>
                                    <FeaturedGrants />
                                </TabPane>

                                {props.userProfile.isFullAdmin ?
                                    <>
                                        <TabPane tab={props.t('Countries')} key={5}>
                                            <CountriesSetting />
                                        </TabPane>
                                        <TabPane tab={props.t('Bin')} key={6}>
                                            <BinControl identity={props.identity} reloadTab={reloadTabBin} />
                                        </TabPane>
                                        {isGrantAdmin &&
                                            <TabPane tab={props.t('Statistics')} key={7}>
                                                <StatisticsIndex />
                                            </TabPane>
                                        }
                                        <TabPane tab={props.t('Featured Messages')} key={8}>
                                            <FeaturedMessages />
                                        </TabPane>
                                        {isGrantAdmin &&
                                            <TabPane tab={props.t('Notification Subscriptions')} key={9}>
                                                <NotificationSubscriptionHome adminPage={true} />
                                            </TabPane>
                                        }
                                        {isGrantAdmin &&
                                            <TabPane tab={props.t('Releases')} key={10}>
                                                <WhatsNewTab />
                                            </TabPane>
                                        }
                                    </> : <></>}
                            </Tabs>
                        </Col>
                    </Row>
                </div>
            </Row>
        </div>
    );
};

export default withIdentity(withCache(withUserProfile(withTranslation()(withRouter(AdminHome)))));
