import React, { FC, useEffect, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { container } from 'src/inversify.config';
import { Alert, Badge, Spin, Tag, Tooltip } from 'antd';
import { QueryParameters } from 'src/core/stores/data-store';
import { TopGrantSummaryStore } from '../../stores/grant-store';
import { CalendarOutlined, MinusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { GetFlag } from '../flags-icons';
import { UserProfileProps, withUserProfile } from '../user-profile';

const TopGrants: FC<
    {
        reload: number;
        selectedCountry: string;
    } & WithTranslation & UserProfileProps
> = ({ t, reload, userProfile, selectedCountry }) => {
    const [loading, setLoading] = useState(false);
    const currentStore = container.get(TopGrantSummaryStore);
    const currentState = currentStore.state;
    const [query] = useState({
        searchQuery: '',
        skip: 0,
        take: 10,
        parameters: { 'countryId': selectedCountry } as QueryParameters,
    });

    useEffect(() => {
        load();
    }, [reload, selectedCountry, t]); // eslint-disable-line react-hooks/exhaustive-deps

    const load = async () => {
        setLoading(true);
        query.parameters = { 'countryId': selectedCountry } as QueryParameters;
        await currentStore.load(query);
        setLoading(false);
    };

    const getTitle = (item: any) => {
        if (item.title) return item.title?.slice(0, 65) + (item.title?.length > 65 ? '...' : '');
        return t("Name to be defined")
    };

    const getAnnuityById = (annuitiesId: string[]) => {
        let result: string[] = []
        annuitiesId.map(x => result.push(userProfile.annuities.filter(a => a.id === x)[0].name))
        return result
    }

    const getIconCountryById = (countryId: string) => {
        const countries = userProfile.countries.filter(c => c.code === countryId);
        return countries[0]?.icon;
    }

    return (    
        <div className="metrix-content">
            <Spin spinning={loading}>
                {currentState.items && currentState.items.length === 0 && (
                    <Alert
                        style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                        message={t('No top grants found...')}
                        showIcon
                        type="warning"
                    />
                )}
                {currentState.items &&
                    currentState.items.length > 0 &&
                    currentState.items.get().map((item, index) => (
                        <Link className={'fi-light-blue-color'} to={`/search/${item.id}`}>
                        <div className={'top-item ibox'}>
                            <div className="item-flag">
                                <Badge color="green" count={index + 1}>
                                    {GetFlag(item.countryId, getIconCountryById(item.countryId))}
                                </Badge>
                            </div>
                            <div className="item-text">
                                <span style={{ marginLeft: 20 }}>
                                    {' '}
                                    <MinusOutlined style={{ marginRight: 10 }} />
                                    {getTitle(item)}
                                </span>
                                {getAnnuityById(item.annuities).map(x =>
                                        <span style={{ marginLeft: 10 }}>
                                        {' '}
                                        <Tooltip title={t('Annuity')}>
                                            <Tag color="gold">
                                                <CalendarOutlined style={{ marginRight: 5 }} />
                                                {x}
                                            </Tag>
                                        </Tooltip>
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    ))
                }
            </Spin>
        </div>
    );
};

export default withTranslation()(withUserProfile(TopGrants));
