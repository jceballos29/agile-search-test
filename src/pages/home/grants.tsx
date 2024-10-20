import { CalendarOutlined, HistoryOutlined, SearchOutlined, InfoCircleOutlined, HeartOutlined } from '@ant-design/icons'
import { Button, Col, Pagination, Row, Spin, Input, Alert, Select, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import ContentHeader from 'src/core/ui/content-header'
import { GrantFilters, BuildFilters } from 'src/components/grant-filters'
import AnnuitySelect from 'src/components/annuity-select'
import CountrySelect from 'src/components/country-select'
import LocationSelect from 'src/components/location-select'
import SectorSelect from 'src/components/sector-select'
import TypologySelect from '../../components/typology-select'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import { container } from 'src/inversify.config'
import { Query } from 'src/core/stores/data-store'
import { GrantBriefSummaryStore } from 'src/stores/grant-store'
import debounce from 'lodash/debounce'
import HttpService from '../../core/services/http.service'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { useHistory } from 'react-router-dom'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import GrantCardEs from './grant-card/grant-card-es'
import SideView from '../../components/side-view'
import SteppedFilter from '../../components/stepped-filter/index'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import clearIcon from 'src/assets/blue-icons-set_1-73.png'
import subscribeIcon from 'src/assets/blue-icons-set_2-14.png'
import { typeFilter } from 'src/utils/interfaces'
import "./index-style.less"
import NotificationsFeaturedMessages from 'src/components/notifications-featured-messages/notifications-featured-messages'
import SplitterLayout from 'react-splitter-layout'
import 'react-splitter-layout/lib/index.css'
import TargetSectorSelect from 'src/components/targetSector-select'
const { Search } = Input
const { Option } = Select

interface GrantListProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps { }

const GrantList: FC<GrantListProps> = (props) => {
  const { t, cache, identity, userProfile } = props
  const history = useHistory()
  const [language, setLenguage] = useState(HttpService.language)
  const [isDecisionTreeOpen, setIsDecisionTreeOpen] = useState(false)
  const currentStore = container.get(GrantBriefSummaryStore)
  const currentState = currentStore.state
  const NavigateToFavorites = () => history.push('/favorites')
  const NavigateToHistory = () => history.push('/history')
  const NavigateToCalendar = () => history.push('/calendar')

  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  useEffect(() => {
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleResize = () => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  };


  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0

  const onlyCountryViewer = (identity.roles ? identity.roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin

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
  const [searchQuery, setSearchQuery] = useState<string | null>(LoadSearchQuery(new URL(window.location.href).searchParams.get('searchQuery')))

  const [query, setQuery] = useState({
    searchQuery: '',
    skip: 0,
    take: 20,
    orderBy: [{ field: 'orderByStatusCategory', direction: 'Ascending', useProfile: false },
    { field: 'publicationDate', direction: 'Descending', useProfile: false }],
  } as Query)

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

    grantQuery.parameters = {
      ...grantQuery.parameters,
      origin: "search"
    };
    await currentStore.load(grantQuery as Query)
    const params = new URLSearchParams()
    if (currentFilter) {
      if (currentFilter.bftypes && currentFilter.bftypes.length > 0) {
        let sw = false
        let arr = [10, 12, 4, 3, 11, 1]
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
            sw = true
            break
          }
        }
        if (sw) {
          currentFilter.bftypes.forEach(item => {
            if (!arr.includes(item.value)) {
              arrAux.push(item)
            }
          })
          currentFilter.bftypes = arrAux
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
      orderBy: [{ field: 'orderByStatusCategory', direction: 'Ascending', useProfile: false },
      { field: 'publicationDate', direction: 'Descending', useProfile: false }],
    }
  }

  const onFilterChanges = (value: any, filterParam: string, loadQuery: boolean) => {
    var currentFilter = filter
    currentFilter[filterParam] = Array.isArray(value) ? value.map((x: any) => ({ value: x.value })) : value
    if (filterParam == typeFilter.countries) currentFilter.locations = undefined
    setFilter(currentFilter)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery as Query)
    setPage(1)
    loadQuery && load(currentQuery)
  }

  const onChangePage = (newpage: any, newPageSize: any) => {
    var currentquery = buildQuery(newpage, newPageSize)
    setQuery(currentquery as Query)
    setPage(newpage)
    setPageSize(newPageSize)
    load(currentquery, searchQuery, newpage, newPageSize)
  }

  const onSearch = debounce((value: string) => {
    let newValue = encodeURIComponent(value)
    setPage(1)
    var currentquery = buildQuery(1, pageSize, filter, newValue)
    setQuery(currentquery as Query)
    cache.saveWithCustomKey('grants-search', newValue, true, true)
    load(currentquery, newValue)
  }, 10)

  const reLoad = () => {
    if (query.searchQuery !== searchQuery) {
      setPage(1)
      load(buildQuery(1))
    } else {
      load(buildQuery())
    }
  }

  const clearFilters = () => {
    var currentFilter = filter
    currentFilter = {}
    setFilter(currentFilter)
    setPage(1)
    setPageSize(10)
    setSearchQuery('')
    cache.saveWithCustomKey('grants-search', '')
    var currentQuery = buildQuery(1, pageSize, currentFilter, '')
    setQuery(currentQuery as Query)
    load(currentQuery)
  }


  return (
    <div style={{ padding: 25 }}>
      <Row gutter={0}>
        <Col span={10} >
          <ContentHeader hideBreadcrumb title={t('Grants Searcher')} />
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
            icon={<HistoryOutlined style={{ color: "#0000a4" }} />}
          >
            {t("History")}
          </Button>

          <Button
            shape="round"
            className={'fi-light-blue-button-new'}
            onClick={() => NavigateToFavorites()}
            style={{ float: 'right', marginRight: 10 }}
            icon={<HeartOutlined style={{ color: "#0000a4" }} />}
          >
            {t("Favorites")}
          </Button>

          <Button
            shape="round"
            className={'fi-light-blue-button-new'}
            onClick={() => NavigateToCalendar()}
            style={{ float: 'right', marginRight: 10 }}
            icon={<CalendarOutlined style={{ color: "#0000a4" }} />}
          >
            {t("Calendar")}
          </Button>

          <Button
            shape="round"
            type={'primary'}
            style={{ float: 'right', marginRight: 10 }}
            icon={<SearchOutlined />}
          >
            {t("Searcher")}
          </Button>
        </Col>
      </Row>
      
      <SplitterLayout style={{ padding: "20px", overflow: "auto" }} customClassName='primary-splitter' primaryIndex={1} secondaryInitialSize={400} secondaryMinSize={400}>
        <Row gutter={16} className="grants-filters">
          <Col span={24}>
            <label>{t('Criteria')}</label>
            <Tooltip title={t('The search is performed by an exact term. If the desired result is not found, it is possible that the searching criteria is incorrect, so we recommend to try another description')}>
              <span style={{ marginLeft: "5px", fontSize: "20px", color: "#0000a4" }}><InfoCircleOutlined /></span>
            </Tooltip>
            <Search
              placeholder={t('Search criteria...')}
              allowClear
              value={searchQuery}
              onChange={(value) => setSearchQuery(value.target.value)}
              onSearch={(value: any) => onSearch(value)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Country')}</label>
            <CountrySelect
              nullable
              mode={'multiple'}
              placeholder={t('Any...')}
              labelInValue={true}
              value={filter.countries}
              onChange={(value) => onFilterChanges(value, typeFilter.countries, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Region')}</label>
            <LocationSelect
              fullLoad={fullLoad}
              placeholder={t('Any...')}
              value={filter.locations}
              countries={filter.countries}
              onChange={(value) => onFilterChanges(value, typeFilter.locations, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Annuity')}</label>
            <AnnuitySelect
              mode={'multiple'}
              labelInValue={true}
              placeholder={t('Any...')}
              value={filter.annuities}
              onChange={(value) => onFilterChanges(value, typeFilter.annuities, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Typology')}</label>
            <Tooltip title={t('Type of project or action to be subsidised by the call proposals')}>
              <span style={{ marginLeft: "5px", fontSize: "20px", color: "#0000a4" }}><InfoCircleOutlined /></span>
            </Tooltip>

            <TypologySelect
              mode={'multiple'}
              value={filter.typologies}
              placeholder={t('Any...')}
              showTooltip={true}
              onChange={(value) => onFilterChanges(value, typeFilter.typologies, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Sector')}</label>
            <Tooltip title={t('Business sectors that may be applicant to the funding call, gathered in the regulation as possible beneficiary')}>
              <span style={{ marginLeft: "5px", fontSize: "20px", color: "#0000a4" }}><InfoCircleOutlined /></span>
            </Tooltip>
            <SectorSelect
              mode={'multiple'}
              value={filter.sectors}
              placeholder={t('Any...')}
              onChange={(value) => onFilterChanges(value, typeFilter.sectors, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Target Sector')}</label>
            <Tooltip title={t('Specific sectors of those gathered in the regulation as possible beneficiary that will have greater financing possibilities, since they are fully aligned with the call objectives and kind of projects to be granted')}>
              <span style={{ marginLeft: "5px", fontSize: "20px", color: "#0000a4" }}><InfoCircleOutlined /></span>
            </Tooltip>
            <TargetSectorSelect
              mode={'multiple'}
              placeholder={t('Any...')}
              value={filter.targetSectors}
              onChange={(value) => onFilterChanges(value, typeFilter.targetSectors, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Beneficiary Type')}</label>
            <BeneficiaryTypeSelect
              mode={'multiple'}
              placeholder={t('Any...')}
              value={filter.bftypes}
              onChange={(value) => onFilterChanges(value, typeFilter.bftypes, true)} />
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Category')}</label>
            <Select
              value={filter.category}
              placeholder={t('Any...')}
              dropdownMatchSelectWidth
              allowClear
              labelInValue
              mode={"multiple"}
              onChange={(value: any) => onFilterChanges(value, typeFilter.category, true)}>
              <Option key={'A'} value={1}>{t('Very important call')}</Option>
              <Option key={'B'} value={2}>{t('Important call')}</Option>
              <Option key={'C'} value={3}>{t('Reactive call')}</Option>
              <Option key={'D'} value={4}>{t('Call not for companies')}</Option>
              <Option key={'E'} value={5}>{t("FI doesn't work this call")}</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Status')}</label>
            <Select
              value={filter.status}
              placeholder={t('Any...')}
              dropdownMatchSelectWidth
              allowClear
              labelInValue
              mode={"multiple"}
              onChange={(value: any) => onFilterChanges(value, typeFilter.status, true)}>
              <Option key={0} value={0}>{t('Closed')}</Option>
              <Option key={2} value={2}>{t('Open')}</Option>
              <Option key={1} value={1}>{t('Pending publication')}</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={24}>
            <label>{t('Minimis')}</label>
            <Select
              placeholder={t('Any...')}
              dropdownMatchSelectWidth
              allowClear
              value={filter.minimis}
              onChange={(value: any) => onFilterChanges(value, typeFilter.minimis, true)}>
              <Option key={1} value={1}>{t('Yes')}</Option>
              <Option key={0} value={0}>{t('No')}</Option>
            </Select>
          </Col>

          <Col sm={24}>
            <Link to="/subscriptions?open=true"><Tooltip title={t('Create suscription')}><img src={subscribeIcon} /></Tooltip></Link>
            <Tooltip title={t('Clear filter')}><img src={clearIcon} onClick={() => clearFilters()} /></Tooltip>
            <Button onClick={() => reLoad()} type="primary" shape="round" icon={<SearchOutlined />}>{t('Search')}</Button>
          </Col>

        </Row>
        <Spin spinning={currentState.isBusy.get()}>
          <Row gutter={10} className={'grants-container'} style={{
            padding: "20px", overflow: "auto"
          }}>
            {currentState.items && currentState.items.length == 0 && (
              <Col span={14}>
                <Alert
                  style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                  message={t('No grants found with the selected criteria...')}
                  showIcon
                  type="warning"
                />
              </Col>
            )}
            <Col span={24}>
              {currentState.items && currentState.items.length > 0 && (
                <div style={{ marginBottom: 20, float: "right" }}>
                  <Pagination
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total: number, range: [number, number]) => `${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total}`}
                    onChange={(pageNumber, pageSize) => onChangePage(pageNumber, pageSize)}
                    current={page}
                    pageSize={pageSize}
                    total={currentState.count.get()}
                    pageSizeOptions={["20", "50", "100"]}
                  />
                </div>
              )}
            </Col>

            {currentState.items && currentState.items.length > 0 &&
              currentState.items.get().map((item) => (
                <Col span={24} >
                  {item && <GrantCardEs item={item} key={item.id} />}
                </Col>
              ))}
          </Row>
        </Spin>
      </SplitterLayout>

      <SideView
        className="top-grants-flyout"
        mask={true}
        getContainer={false}
        onClose={() => setIsDecisionTreeOpen(false)}
        visible={isDecisionTreeOpen}>
        <SteppedFilter />
      </SideView>
    </div>
  )
}

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(GrantList)))))
