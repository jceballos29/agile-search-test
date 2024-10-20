import { CalendarOutlined, ClearOutlined, HeartOutlined, HistoryOutlined, NotificationOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Col, Pagination, Row, Spin, Input, Alert, Select, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { GrantFilters, BuildFilters } from 'src/components/grant-filters'
import { container } from 'src/inversify.config'
import { Query } from 'src/core/stores/data-store'
import { GrantBriefSummaryStore } from 'src/stores/grant-store'
import ContentHeader from 'src/core/ui/content-header'
import AnnuitySelect from 'src/components/annuity-select'
import CountrySelect from 'src/components/country-select'
import LocationSelect from 'src/components/location-select'
import SectorSelect from 'src/components/sector-select'
import TypologySelect from '../../components/typology-select'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import debounce from 'lodash/debounce'
import HttpService from '../../core/services/http.service'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import { useHistory } from 'react-router-dom'
import GrantCardEs from './grant-card/grant-card-es'
import { typeFilter } from 'src/utils/interfaces'
import NotificationsFeaturedMessages from 'src/components/notifications-featured-messages/notifications-featured-messages'
const { Search } = Input
const { Option } = Select

interface GrantFavoriteListProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps { }

const GrantFavoriteList: FC<GrantFavoriteListProps> = (props) => {
  const { t, cache, identity, userProfile } = props
  const history = useHistory()

  const currentStore = container.get(GrantBriefSummaryStore)
  const currentState = currentStore.state

  const LoadFilter = (filter: string | null) => {
    if (filter != null) return JSON.parse(filter)
    var storeQuery = cache.getWithCustomKey('grants-filter')
    return storeQuery ?? ({} as GrantFilters)
  }

  const LoadPage = (filter: string | null) => {
    if (filter != null) return JSON.parse(filter)
    var storeQuery = cache.getWithCustomKey('grants-page')
    return storeQuery ?? 1
  }

  const LoadPageSize = (filter: string | null) => {
    if (filter != null) return JSON.parse(filter)
    var storeQuery = cache.getWithCustomKey('grants-pageSize')
    if (storeQuery) return JSON.parse(storeQuery)
    return storeQuery ?? 20
  }

  const LoadSearchQuery = (filter: string | null) => {
    if (filter != null) return filter
    var storeQuery = cache.getWithCustomKey('grants-search')
    if (storeQuery) return storeQuery
    return storeQuery ?? ''
  }

  const [filter, setFilter] = useState(LoadFilter(new URL(window.location.href).searchParams.get('filter')))
  const [page, setPage] = useState(LoadPage(new URL(window.location.href).searchParams.get('page')))
  const [pageSize, setPageSize] = useState(LoadPageSize(new URL(window.location.href).searchParams.get('pageSize')))
  const [fullLoad, setFullLoad] = useState(false)
  const [searchQuery, setSearchQuery] = useState(LoadSearchQuery(new URL(window.location.href).searchParams.get('searchQuery')))

  const [language, setLenguage] = useState(HttpService.language)

  const NavigateToGrants = () => { history.push('/') }
  const NavigateToHistory = () => { history.push('/history') }
  const NavigateToCalendar = () => { history.push('/calendar') }

  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0

  const onlyCountryViewer = (identity.roles ? identity.roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin

  const [query, setQuery] = useState({
    searchQuery: '',
    skip: 0,
    take: 100,
    parameters: {
      showFavorites: true,
    },
  })

  useEffect(() => {
    setFullLoad(true)
    load(buildQuery())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (language != HttpService.language) {
      setLenguage(HttpService.language)
      load(buildQuery())
    }
  }, [t]) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async (
    grantQuery: any,
    currentSearchQuery: string = searchQuery,
    currentPage: number = page,
    currentPageSize: number = pageSize,
    currentFilter: any = filter
  ) => {
    cache.saveWithCustomKey('grants-query', grantQuery)
    cache.saveWithCustomKey('grants-page', currentPage)
    cache.saveWithCustomKey('grants-pageSize', currentPageSize)

    await currentStore.load(grantQuery as Query)
    const params = new URLSearchParams()

    if (currentFilter) {
      if (currentFilter.bftypes && currentFilter.bftypes.length > 0) {
        let sw = false;
        let arr = [10, 12, 4, 3, 11, 1];
        let arrAux = [
          { value: 10 },
          { value: 12 },
          { value: 4 },
          { value: 3 },
          { value: 11 },
          { value: 1 },
        ]

        for (var i = 0; i < currentFilter.bftypes.length; i++) {
          if (currentFilter.bftypes[i].value === 1) {
            sw = true;
            break;
          }
        }
        if (sw) {
          currentFilter.bftypes.forEach(item => {
            if (!arr.includes(item.value)) {
              arrAux.push(item)
            }
          })
          currentFilter.bftypes = arrAux;
        }
      }
      params.append('filter', JSON.stringify(currentFilter))
    } else params.delete('filter')

    currentSearchQuery ? params.append('searchQuery', currentSearchQuery) : params.delete(searchQuery)
    currentPage ? params.append('page', currentPage.toString()) : params.delete('page')
    currentPageSize ? params.append('pageSize', currentPageSize.toString()) : params.delete('pageSize')
    history.push({ search: params.toString() })
  }

  const buildQuery = (
    currentpage: number = page,
    currentpageSize: number = pageSize,
    currentfilter: GrantFilters = filter,
    search: string = searchQuery
  ) => {
    cache.saveWithCustomKey('grants-filter', currentfilter, true, true)
    return {
      searchQuery: search,
      skip: (currentpage - 1) * currentpageSize,
      take: currentpageSize,
      filter: BuildFilters(currentfilter),
      parameters: {
        showFavorites: true,
        typologies: currentfilter.sectors && currentfilter.sectors.length > 0 ? currentfilter.sectors.map(t => t.value) : undefined
      },
    }
  }

  const onFilterChanges = (value: any, filterParam: string) => {
    var currentFilter = filter
    currentFilter[filterParam] = Array.isArray(value) ? value.map((x: any) => ({ value: x.value })) : value
    if (filterParam == typeFilter.countryId) currentFilter.locations = undefined
    setFilter(currentFilter)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    setPage(1)
    load(currentQuery)
  }

  const onChangePage = (newpage: any, newPageSize: any) => {
    var currentquery = buildQuery(newpage, newPageSize)
    setQuery(currentquery)
    setPage(newpage)
    setPageSize(newPageSize)
    load(currentquery, searchQuery, newpage, newPageSize)
  }

  const onSearch = debounce((value: string) => {
    setSearchQuery(value)
    setPage(1)
    var currentquery = buildQuery(1, pageSize, filter, value)
    setQuery(currentquery)
    cache.saveWithCustomKey('grants-search', value)
    load(currentquery, value)
  }, 10)

  const clearFilters = () => {
    var currentFilter = filter
    currentFilter = {}
    setFilter(currentFilter)
    setPage(1)
    setPageSize(10)
    cache.saveWithCustomKey('grants-search', '')
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setSearchQuery('')
    setQuery(currentQuery)
    load(currentQuery, searchQuery, 1, 10)
  }

  return (
    <div style={{ padding: 25 }}>

      <Row gutter={0}>

        <Col span={10}>
             <ContentHeader hideBreadcrumb title={t('Favorite Grants')} showBack showBackLink="/" />
        </Col>

        <Col span={14}>
            {!onlyCountryViewer && userProfile.isFullAdmin &&
              <NotificationsFeaturedMessages />
            }
 
            <Button
              shape="round"
              className={'fi-light-blue-button-new'}
              onClick={() => NavigateToHistory()}
              style={{ float: 'right', marginRight: !onlyCountryViewer && userProfile.isFullAdmin ? 10 : 30 }}
              icon={<HistoryOutlined style={{color:"#0000a4"}} />}
            >
            {t("History")}
            </Button>
 
            <Button
              shape="round"
              type="primary" style={{ float: 'right', marginRight: 10 }}             
              icon={<HeartOutlined />}
            >
            {t("Favorites")}
            </Button>
 
            <Button
              shape="round"
              className={'fi-light-blue-button-new'}
              onClick={() => NavigateToCalendar()}
              style={{ float: 'right', marginRight: 10 }}
              icon={<CalendarOutlined style={{color:"#0000a4"}}/>}
            >
            {t("Calendar")}
            </Button>
 
            <Button              
              shape="round"
              className={'fi-light-blue-button-new'}
              onClick={() => NavigateToGrants()}
              style={{ float: 'right', marginRight: 10 }}
              icon={<SearchOutlined style={{color:"#0000a4"}} /> }
            >
            {t("Searcher")}
            </Button>
        </Col>
      </Row>


      <Row gutter={[10, 10]}>
        <Col span={8}>
          <label>{t('Criteria')}</label>
          <Search
            placeholder={t('Search criteria...')}
            value={searchQuery}
            onChange={(value) => setSearchQuery(value.target.value)}
            onSearch={(value: any) => { onSearch(value) }}
          />
        </Col>

        <Col span={4}>
          <label>{t('Country')}</label>
          <CountrySelect
            nullable
            placeholder={t('All')}
            value={filter.countryId}
            onChange={(value) => onFilterChanges(value, typeFilter.countryId)} />
        </Col>

        <Col span={8}>
          <label>{t('Region')}</label>
          <LocationSelect
            fullLoad={fullLoad}
            placeholder={t('All')}
            value={filter.locations}
            countries={[{ value: filter.countryId, label: '' }]}
            onChange={(value) => onFilterChanges(value, typeFilter.locations)}
          />
        </Col>

        <Col span={4}>
          <label>{t('Annuity')}</label>
          <AnnuitySelect
            mode={'multiple'}
            labelInValue={true}
            placeholder={t('All')}
            value={filter.annuityId}
            onChange={(value) => onFilterChanges(value, typeFilter.annuities)} />
        </Col>

        <Col span={5} >
          <label>{t('Typologies')}</label>
          <TypologySelect
            mode={'multiple'}
            value={filter.typologies}
            placeholder={t('All')}
            onChange={(value) => onFilterChanges(value, typeFilter.typologies)} />
        </Col>

        <Col span={5} >
          <label>{t('Sectors')}</label>
          <SectorSelect
            mode={'multiple'}
            value={filter.sectors}
            placeholder={t('All')}
            onChange={(value) => onFilterChanges(value, typeFilter.sectors)} />
        </Col>

        <Col span={5} >
          <label>{t('Beneficiary Type')}</label>
          <BeneficiaryTypeSelect
            mode={'multiple'}
            placeholder={t('All')}
            value={filter.bftypes}
            onChange={(value) => onFilterChanges(value, typeFilter.bftypes)} />
        </Col>

        <Col span={3} >
          <label>{t('Source')}</label>
          <Select
            placeholder={t('All')}
            dropdownMatchSelectWidth
            allowClear
            value={filter.sources}
            style={{ width: '100%', minWidth: 60 }}
            onChange={(value: any) => onFilterChanges(value, typeFilter.sources)}
          >
            <Option key={2} value={2}> {t('Public')} </Option>
            <Option key={1} value={1}> {t('Private')} </Option>
          </Select>
        </Col>

        <Col span={3} >
          <label>{t('Status')}</label>
          <Select
            value={filter.status}
            placeholder={t('All')}
            dropdownMatchSelectWidth
            labelInValue
            mode={"multiple"}
            allowClear
            style={{ width: '100%', minWidth: 60 }}
            onChange={(value: any) => onFilterChanges(value, typeFilter.status)}
          >
            <Option key={0} value={0}>{t('Closed')}</Option>
            <Option key={2} value={2}>{t('Open')}</Option>
            <Option key={1} value={1}>{t('Pending publication')}</Option>
          </Select>
        </Col>

        <Col span={3}>
          <label>{t('Minimis')}</label>
          <Select
            placeholder={t('All')}
            dropdownMatchSelectWidth
            allowClear
            value={filter.minimis}
            style={{ width: '100%', minWidth: 60 }}
            onChange={(value: any) => onFilterChanges(value, typeFilter.minimis)}
          >
            <Option key={1} value={1}> {t('Yes')} </Option>
            <Option key={0} value={0}> {t('No')} </Option>
          </Select>
        </Col>

        <Col span={24} >
          <Row style={{ float: 'right', marginTop: 20 }}>

            <Link to="/subscriptions?open=true">
              <Button
                style={{ marginRight: 30, backgroundColor: '#647288', color: 'white' }}
                icon={<NotificationOutlined />}>
                {t('Suscribe')}
              </Button>
            </Link>

            <Button
              onClick={() => clearFilters()}
              style={{ marginRight: 30, float: 'right' }}
              icon={<ClearOutlined />}>
              {t('Clear') + ' '}
            </Button>

            <Button
              type="primary"
              onClick={() => load(buildQuery())}
              style={{ float: 'right', marginRight: 30 }}
              icon={<SearchOutlined />}>
              {t('Search')}
            </Button>

            {currentState.items && (
              <Pagination
                showSizeChanger
                showQuickJumper
                showTotal={(total: number, range: [number, number]) => `${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total}`}
                onChange={(pageNumber, pageSize) => onChangePage(pageNumber, pageSize)}
                current={page}
                pageSize={pageSize}
                total={currentState.count.get()}
              />
            )}

          </Row>
        </Col>

      </Row>

      <Spin spinning={currentState.isBusy.get()}>
        <Row gutter={[24, 16]}>

          {currentState.items && currentState.items.length == 0 && (
            <Col span={24}>
              <Alert
                style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                message={t('No grants found with the selected criteria...')}
                showIcon
                type="warning"
              />
            </Col>
          )}

          {currentState.items && currentState.items.length > 0 &&
            <>
              {currentState.items.get().map((item) => (
                <Col xs={12} md={12} sm={24}>
                  {item && <GrantCardEs item={item} key={item.id} />}
                </Col>
              ))}

              <Col span={24}>
                <div style={{ float: 'right', marginBottom: 20 }}>
                  <Pagination
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total: number, range: [number, number]) => `${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total}`}
                    onChange={(pageNumber, pageSize) => onChangePage(pageNumber, pageSize)}
                    current={page}
                    pageSize={pageSize}
                    total={currentState.count.get()}
                  />
                </div>
              </Col>
            </>
          }


        </Row>
      </Spin>
    </div>
  )
}
export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(GrantFavoriteList)))))
