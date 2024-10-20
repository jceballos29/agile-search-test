import {
  CalendarOutlined,
  MinusOutlined,
  PlusOutlined,
  ExclamationCircleTwoTone,
  MenuOutlined,
} from '@ant-design/icons'
import { Button, Card, Row, Spin, Tag, Tooltip, Alert, Badge, Popover, message, Pagination } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { container } from 'src/inversify.config'
import { Query, QueryParameters } from 'src/core/stores/data-store'
import { FeaturedGrantSummaryStore } from 'src/stores/grant-store'
import HttpService from '../../core/services/http.service'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { GetFlag } from '../../components/flags-icons'
import GrantSelect from 'src/components/grant-select'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import { arrayMoveImmutable } from 'array-move'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import CountrySelect from 'src/components/country-select'

interface ConfigSettingHomeProps extends WithTranslation, RouteComponentProps, CacheProps, UserProfileProps { }

interface FeaturedGrant {
  id: string
  title: string
  countryId: string
  annuities: string[]
  countryIcon: string
}

const FeaturedGrants: FC<ConfigSettingHomeProps> = (props) => {
  const { t, userProfile } = props
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [additionalCountryOptions] = useState([{ code: 'GLOBAL', name: 'Global' }])
  const [selectedFeaturedCountry, setSelectedFeaturedCountry] = useState('GLOBAL')

  useEffect(() => {
    setIsBusy(false)
    setCurrentPage(1)
    Load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [query] = useState({
    searchQuery: '',
    skip: 0,
    take: 10,
    parameters: { 'countryId': selectedFeaturedCountry } as QueryParameters,
  } as Query)

  useEffect(() => {
    setIsBusy(false)
    setCurrentPage(1)
    query.searchQuery = ''
    query.skip = 0
    query.take = 10
    query.parameters = { 'countryId': selectedFeaturedCountry } as QueryParameters
    Load()
  }, [selectedFeaturedCountry, t]) // eslint-disable-line react-hooks/exhaustive-deps

  const httpService = container.get(HttpService)
  const currentStore = container.get(FeaturedGrantSummaryStore)
  const currentState = currentStore.state

  const [featuredGrants, setFeaturedGrants] = useState<FeaturedGrant[]>([])
  const [countFeaturedGrants, setCountFeaturedGrants] = useState<number>(0)

  const getTitle = (item: any) => {
    if (item.title) return item.title?.slice(0, 125) + (item.title?.length > 125 ? '...' : '');
    return t("Name to be defined")
  }

  const onChangePage = (newpage: number) => {
    if (newpage !== currentPage) {
      setCurrentPage(newpage)
      query.skip = (newpage - 1) * 10
      Load()
    }
  };

  const Load = async (currentQuery: Query = query) => {
    setIsBusy(true)
    await currentStore.load(currentQuery)
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
    setIsBusy(false)
  }

  const Upsert = async (list: string[]) => {
    await httpService.post(`api/v1/grants/featured`, {
      GrantsIds: list,
      CountryId: selectedFeaturedCountry,
    })
    Load()
  }

  const SetOrder = async (list: string[]) => {
    await httpService.post(`api/v1/grants/featured/reorder`, {
      Grants: list,
      CountryId: selectedFeaturedCountry,
    })
  }

  const onAddGrants = (list: any[]) => {
    setShowModal(false)
    let res = 5 - countFeaturedGrants
    if (res < list.length) {
      messageApi.open({
        type: 'error',
        content: `${t('You cannot add more than 5 featured grants in this country.')}`,
        duration: 5
      })
    } else {
      Upsert(list)
    }
  }

  const showModalFeatured = () => {
    if (countFeaturedGrants >= 5) {
      messageApi.open({
        type: 'warning',
        content: `${t('You cannot add more than 5 featured grants in this country.')}`,
        duration: 5
      })
    } else {
      setShowModal(true);
    }
  }

  const onDeleteGrant = async (id: string) => {
    setIsBusy(true);
    await currentStore.delete(id);
    const updatedGrants = featuredGrants.filter(grant => grant.id !== id);
    setFeaturedGrants(updatedGrants);
    SetOrder(updatedGrants.map((grant) => grant.id));
    setCountFeaturedGrants(updatedGrants.length)
    setIsBusy(false);
  }

  const getContent = (id: string) => {
  return (
    <Button onClick={() => onDeleteGrant(id)} danger>
      {t('Delete')}
    </Button>
    )
  }

  const DragHandle = selectedFeaturedCountry === 'GLOBAL' ? 
  () => <MenuOutlined style={{ color: '#999', paddingRight: 15 }} /> : 
  SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999', paddingRight: 15 }} />);


  const getAnnuityById = (annuitiesId: string[])  => {
    let result : string[] = []
    annuitiesId.map(x => result.push( userProfile.annuities.filter(a => a.id === x)[0].name ))
    return result;

  }

  const getIconCountryById = (countryId: string) => {
    const countries = userProfile.countries.filter(c => c.code === countryId)
    return countries[0]?.icon
  }

  const SortableItem = SortableElement(({ value }: any) => {
    var index = featuredGrants.indexOf(value)
    return (
      <li style={{ listStyle: 'none' }}>
        <div className={'top-item ibox noselect fi-light-blue-color '}>
          <DragHandle />
          <div className="item-flag">
            <Badge color="green" count={query.skip + index + 1}>
              {GetFlag(value.countryId, value.countryIcon)}
            </Badge>
          </div>
          <div className="item-text">
            <Link className={'fi-light-blue-color'} to={`/search/${value.id}`}>
              <span style={{ marginLeft: 20 }}>
                {' '}
                <MinusOutlined style={{ marginRight: 10 }} />             
              {value.title}
              </span>
            </Link>
            {value.annuity && (
              <span style={{ marginLeft: 10 }}>
                {' '}
                <Tooltip title={t('Annuity')}>
                  <Tag color="gold">
                    <CalendarOutlined style={{ marginRight: 5 }} />
                    {value.annuity}
                  </Tag>
                </Tooltip>
              </span>
            )}
          </div>

          <div style={{ float: 'right' }}>{selectedFeaturedCountry !== 'GLOBAL' ? getContent(value.id): <></> }</div>
        </div>
      </li>
    )
  })

  const SortableList = SortableContainer(({ items }: any) => {
    return (
      <ul style={{ listStyle: 'none' }}>
        {items.map((value: any, index: number) => (
          <SortableItem key={`item-${index}`} index={index} value={value} />
        ))}
      </ul>
    )
  })

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    var newItems = arrayMoveImmutable(featuredGrants, oldIndex, newIndex)
    setFeaturedGrants(newItems)
    setCountFeaturedGrants(newItems.length)
    SetOrder(newItems.map((t) => t.id))
  }

  const showWarning = () => {
    return currentState.items && (selectedFeaturedCountry === 'GLOBAL' || countFeaturedGrants >= 5)
  }

  const BuildGrantFilter = (grants: FeaturedGrant[]): number[] => {
    return grants.map((g) => parseInt(g.id))
  }

  const popOverContent = (
    <div> 
      { showWarning() && selectedFeaturedCountry === 'GLOBAL' 
       ? <span>{t('Please note that only the first 10 grants will be shown in the sidebar.')} {t('You will not be able to reorder or delete with the Global selection.')}</span>
       : <span>{t('You can only add 5 featured grants per country.')}</span>}
    </div>
  )

  return (
    <>
      {contextHolder}
      <Card
        title={
          <div>
            <span style={{ paddingRight: '5px' }}>{t('Featured Grants')}</span>
            <Popover content={popOverContent} title={<span style={showWarning() ? { color: '#D13A2C' } : { color: '#4FA8FB' }}>{t('Warning')}</span>}>
              <ExclamationCircleTwoTone className={'grants-warning'} twoToneColor={showWarning() ? '#D13A2C' : '#4FA8FB'} />
            </Popover>
          </div>
        }
      >
        <Row align="middle" justify="space-between">
          <div style={{ width: '100%', margin: '0 5px', overflow: 'hidden'}}>
            <div style={{ width: '100%'}}>
              <Tooltip title={selectedFeaturedCountry === 'GLOBAL' ? t('You must select a country') : t('Add Featured Grants')}>
                <Button type="primary" onClick={showModalFeatured} icon={<PlusOutlined />} disabled={selectedFeaturedCountry === 'GLOBAL'} />
              </Tooltip>
              </div>
              <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '15px', marginTop: '-32px' }}>
              <CountrySelect
                additionalOptions={additionalCountryOptions}
                width={200}
                value={selectedFeaturedCountry}
                onChange={(value) => { setSelectedFeaturedCountry(value) }}>
              </CountrySelect>
            </div>
            <Spin spinning={isBusy}>
              {currentState.items && featuredGrants.length === 0 && (
                <Alert
                  style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                  message={t('No top grants found...')}
                  showIcon
                  type="warning"
                />
              )}
              {currentState.items && featuredGrants.length > 0 && <SortableList items={featuredGrants} onSortEnd={onSortEnd} useDragHandle />}
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
          {showModal && (
            <GrantSelect onAddGrants={onAddGrants} countrySelected={selectedFeaturedCountry} excludeGrantsFilter={BuildGrantFilter(featuredGrants)} onClose={() => setShowModal(false)} />
          )}
        </Row>
      </Card>

    </>
  )
}

export default withCache(withUserProfile(withTranslation()(withRouter(FeaturedGrants))))
