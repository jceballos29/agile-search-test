import React, { FC, useEffect, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Tabs, Tooltip } from 'antd'
import SideView from '../side-view'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { AreaChartOutlined } from '@ant-design/icons'
import TopGrantsView from './top-grants'
import FeaturedGrantsView from './featured-grants'
import './metrix.less'
import { UserProfileProps, withUserProfile } from '../user-profile';
import { withIdentity, IdentityProps } from "src/core/services/authentication";
import CountrySelect from 'src/components/country-select'
const { TabPane } = Tabs

const ShellGrantMetrix: FC<{} & WithTranslation & UserProfileProps & IdentityProps> = (props) => {
    const { t } = props
    const { userProfile } = props
    const { identity } = props
    const [isOpen, setIsOpen] = useState(false)
    const [reloadTop, setReloadTop] = useState(-1)
    const [reloadFeatured, setReloadFeatured] = useState(-1)
    const [showSelectedCountry, setShowSelectedCountry] = useState(true)
    const isAdmin = identity.roles.filter((o) => o.includes('Administrator')).length > 0;
    const onlyCountryViewer = (identity.roles ? identity.roles : [])
        .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;
    const [additionalCountryOptions] = useState([{ code: 'GLOBAL', name: 'Global' }])
    const [selectedTopCountry, setSelectedTopCountry] = useState('GLOBAL')
    const [selectedFeaturedCountry, setSelectedFeaturedCountry] = useState('GLOBAL')

    useEffect(() => {
        const connection = new HubConnectionBuilder().withUrl(`${process.env.PUBLIC_URL}/hubs/grantmetrix`).withAutomaticReconnect().build()
        connection
            .start()
            .then(() => {
                connection.on('NewGrantView', (data: any) => {
                    setReloadTop(new Date().getTime())
                })
                connection.on('FeaturedChange', (data: any) => {
                    setReloadFeatured(new Date().getTime())
                })
            })
            .catch((e: Error) => console.error('Connection failed: ', e))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {props.children}
            {!onlyCountryViewer &&
                <div className={'messageFloating'}>
                    <div
                        className={'floating-container'}
                        style={{ background: '#00aeff' }}
                        onClick={() => {
                            setIsOpen(!isOpen)
                        }}
                    >
                        <Tooltip title={t('Top Grants')} placement="topRight">
                            <AreaChartOutlined style={{ fontSize: '32px', marginTop: 12 }} />
                        </Tooltip>
                    </div>
                </div>
            }

            <SideView className="top-grants-flyout" mask={true} getContainer={false} onClose={() => setIsOpen(false)} visible={isOpen}>
                <div className="filter-container">
                    <div className="tabs-container">
                        <Tabs tabBarExtraContent={
                            <div className="country-select-container">
                                {showSelectedCountry && userProfile.countries.length > 1 && (
                                    <CountrySelect
                                        additionalOptions={additionalCountryOptions}
                                        width={180}
                                        value={selectedTopCountry}
                                        onChange={(value) => { setSelectedTopCountry(value) }}>
                                    </CountrySelect>
                                )}
                                {!showSelectedCountry && userProfile.countries.length > 1 && (
                                    <CountrySelect
                                        additionalOptions={additionalCountryOptions}
                                        width={180}
                                        value={selectedFeaturedCountry}
                                        onChange={(value) => { setSelectedFeaturedCountry(value) }}>
                                    </CountrySelect>
                                )}
                            </div>}
                            defaultActiveKey="1" onChange={(key) => setShowSelectedCountry(key === '1')}>
                            <TabPane tab={props.t('Top Grants')} key={1}>
                                <TopGrantsView reload={reloadTop} selectedCountry={selectedTopCountry} />
                            </TabPane>
                            <TabPane tab={props.t('Featured Grants')} key={2}>
                                <FeaturedGrantsView reload={reloadFeatured} selectedCountry={selectedFeaturedCountry} />
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </SideView>
        </>
    )
}

export default withIdentity(withTranslation()(withUserProfile(ShellGrantMetrix)))
