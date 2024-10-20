import React, { FC, useEffect, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { container } from 'src/inversify.config';
import { Alert, Badge, Spin, Tag, Tooltip, Pagination } from 'antd';
import { FeaturedGrantSummaryStore } from '../../stores/grant-store';
import { CalendarOutlined, MinusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { GetFlag } from '../flags-icons';
import { UserProfileProps, withUserProfile } from '../user-profile';
import { QueryParameters } from 'src/core/stores/data-store'

interface ConfigSettingHomeProps extends WithTranslation, UserProfileProps { }

interface FeaturedGrant {
  id: string
  title: string
  countryId: string
  annuities: string[]
  countryIcon: string
}

const FeaturedGrants: FC<{ reload: number, selectedCountry: string } & ConfigSettingHomeProps> = (props) => {
  const { t, userProfile, reload, selectedCountry } = props
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const currentStore = container.get(FeaturedGrantSummaryStore);
  const currentState = currentStore.state;
  const [query] = useState({
    searchQuery: '',
    skip: 0,
    take: 10,
    parameters: { 'countryId': selectedCountry } as QueryParameters,
  });
  const [featuredGrants, setFeaturedGrants] = useState<FeaturedGrant[]>([])
  const [countFeaturedGrants, setCountFeaturedGrants] = useState<number>(0)

  useEffect(() => {
    setLoading(false)
    setCurrentPage(1)
    query.searchQuery = ''
    query.skip = 0
    query.take = 10
    query.parameters = { 'countryId': selectedCountry } as QueryParameters
    load()
  }, [reload, selectedCountry, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const getTitle = (item: any) => {
    if (item.title) return item.title?.slice(0, 65) + (item.title?.length > 65 ? '...' : '');
    return t("Name to be defined")
  };

  const getAnnuityById = (annuitiesId: string[]) => {
    let result: string[] = []
    annuitiesId.map(x => result.push(userProfile.annuities.filter(a => a.id === x)[0].name))
    return result;
  }

  const getIconCountryById = (countryId: string) => {
    const countries = userProfile.countries.filter(c => c.code === countryId);
    return countries[0]?.icon;
  }

  const onChangePage = (newpage: number) => {
    if (newpage !== currentPage) {
      setCurrentPage(newpage)
      query.skip = (newpage - 1) * 10
      load()
    }
  };

  const load = async () => {
    setLoading(true);
    await currentStore.load(query)
    var list: FeaturedGrant[] = []
    currentState.get().items.forEach((t) =>
      list.push({
        title: getTitle(t),
        countryId: t.countryId,
        id: t.id,
        annuities: getAnnuityById(t.annuities),
        countryIcon: getIconCountryById(t.countryId)
      })
    )
    setFeaturedGrants(list)
    setCountFeaturedGrants(currentState.count.get())
    setLoading(false);
  }

  return (
    <div className="metrix-content">
      <Spin spinning={loading}>
        {currentState.items && featuredGrants.length === 0 && (
          <Alert
            style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
            message={t('No featured grants found...')}
            showIcon
            type="warning"
          />
        )}
        {currentState.items &&
          featuredGrants.map((item, index) => (
            <Link className={'fi-light-blue-color'} to={`/search/${item.id}`}>
              <div className={'top-item ibox'}>
                <div className="item-flag">
                  <Badge color="green" count={query.skip + index + 1}>
                    {GetFlag(item.countryId, item.countryIcon)}
                  </Badge>
                </div>
                <div className="item-text">
                  <span style={{ marginLeft: 20 }}>
                    {' '}
                    <MinusOutlined style={{ marginRight: 10 }} />
                    {item.title}
                  </span>
                  {item.annuities.map( x =>
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
        ))}
        {currentState.items && featuredGrants.length > 0 &&
          <div style={{ display: 'flex', justifyContent: 'end' }}>
             <Pagination
               simple
               hideOnSinglePage
               showSizeChanger
               showQuickJumper
               current={currentPage}
               total={countFeaturedGrants}
               showTotal={(total: number) => `${total} ${t("Featured Grants").toLowerCase()}`}
               onChange={(pageNumber) => onChangePage(pageNumber)}
             />
          </div> 
        }
      </Spin>
    </div>
  );
};

export default withTranslation()(withUserProfile(FeaturedGrants))
