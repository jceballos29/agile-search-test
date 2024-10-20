import { CalendarOutlined, HeartOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Col, Row, Spin, Alert, Select, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ContentHeader from 'src/core/ui/content-header'
import { GrantFilters } from 'src/components/grant-filters'
import { container } from 'src/inversify.config'
import { Query } from 'src/core/stores/data-store'
import { GrantHistorySummaryStore } from 'src/stores/grant-store'
import HttpService from '../../core/services/http.service'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { useHistory } from 'react-router-dom'
import GrantCardEs from './grant-card/grant-card-es'
import NotificationsFeaturedMessages from 'src/components/notifications-featured-messages/notifications-featured-messages'
const { Option } = Select

interface GrantHistoryListProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps { }

const GrantHistoryList: FC<GrantHistoryListProps> = (props) => {
  const { t, cache, identity, userProfile } = props
  const history = useHistory()

  const NavigateToFavorites = () => { history.push('/favorites') }
  const NavigateToGrants = () => { history.push('/') }
  const NavigateToCalendar = () => { history.push('/calendar') }

  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0

  const onlyCountryViewer = (identity.roles ? identity.roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin

  const LoadFilter = (filter: string | null) => {
    if (filter != null) {
      return JSON.parse(filter)
    }
    var storeQuery = cache.getWithCustomKey('grants-history-filter')
    return storeQuery ?? ({} as GrantFilters)
  }

  const [filter] = useState(LoadFilter(new URL(window.location.href).searchParams.get('filter')))

  const LoadPage = (filter: string | null) => {
    if (filter != null) {
      return JSON.parse(filter)
    }

    var storeQuery = cache.getWithCustomKey('grants-history-page')

    return storeQuery ?? 1
  }
  const [page, setPage] = useState(LoadPage(new URL(window.location.href).searchParams.get('page')))

  const LoadPageSize = (filter: string | null) => {
    if (filter != null) {
      return JSON.parse(filter)
    }

    var storeQuery = cache.getWithCustomKey('grants-history-pageSize')
    if (storeQuery) {
      return JSON.parse(storeQuery)
    }
    return storeQuery ?? 10
  }
  const [pageSize, setPageSize] = useState(LoadPageSize(new URL(window.location.href).searchParams.get('pageSize')))

  const LoadSearchQuery = (filter: string | null) => {
    if (filter != null) {
      return filter
    }

    var storeQuery = cache.getWithCustomKey('grants-history-search')
    if (storeQuery) {
      return storeQuery
    }
    return storeQuery ?? ''
  }

  const [searchQuery] = useState(LoadSearchQuery(new URL(window.location.href).searchParams.get('searchQuery')))
  const [language, setLenguage] = useState(HttpService.language)
  const currentStore = container.get(GrantHistorySummaryStore)
  const currentState = currentStore.state

  useEffect(() => {
    load(buildQuery())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (language !== HttpService.language) {
      setLenguage(HttpService.language)
      load(buildQuery())
    }
  }, [t]) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async (
    grantQuery: any,
    currentPage: number = page,
    currentPageSize: number = pageSize,
  ) => {
    cache.saveWithCustomKey('grants-history-query', grantQuery)
    cache.saveWithCustomKey('grants-history-page', currentPage)
    cache.saveWithCustomKey('grants-history-pageSize', currentPageSize)

    await currentStore.load(grantQuery as Query)
    const params = new URLSearchParams()
    if (currentPageSize) params.append('pageSize', currentPageSize.toString())
    else params.delete('pageSize')

    history.push({ search: params.toString() })
  }

  const buildQuery = (
    currentpage: number = page,
    currentpageSize: number = pageSize,
    currentfilter: GrantFilters = filter,
    search: string = searchQuery
  ) => {
    cache.saveWithCustomKey('grants-history-filter', currentfilter)
    return {
      searchQuery: search,
      skip: (currentpage - 1) * currentpageSize,
      take: currentpageSize,
    }
  }

  const onChangePage = (newpage: any, newPageSize: any) => {
    var currentquery = buildQuery(newpage, newPageSize)
    setPage(newpage)
    setPageSize(newPageSize)
    load(currentquery, newpage, newPageSize)
  }

  const reLoad = () => {
    load(buildQuery())
  }

  const getGrantCard = (grant: any) => {
    if (!grant) return <div></div>
    return <GrantCardEs item={grant} height={375} />
  }

  return (
    <div style={{ padding: 25 }}>
      <Row gutter={0}>
        <Col span={10}>
             <ContentHeader hideBreadcrumb title={t('Grants History')} showBack showBackLink="/" />
        </Col>
        <Col span={14}>
            {!onlyCountryViewer && userProfile.isFullAdmin &&
              <NotificationsFeaturedMessages />
            }
 
            <Button
              shape="round"
              type="primary" style={{ float: 'right', marginRight: !onlyCountryViewer && userProfile.isFullAdmin ? 10 : 30 }}    
              icon={<HistoryOutlined />}
            >
            {t("History")}
            </Button>
 
            <Button
              shape="round"
              className={'fi-light-blue-button-new'}
              onClick={() => NavigateToFavorites()}
              style={{ float: 'right', marginRight: 10 }}            
              icon={<HeartOutlined style={{color:"#0000a4"}} />}
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
      <Row gutter={10} align="top" justify="space-between">
        <Col span={24}>
          <Row style={{ float: 'right' }}>
            <Button type="primary" onClick={() => reLoad()} style={{ float: 'right', marginRight: 70 }} icon={<SearchOutlined />}>
               {t('Refresh')}
            </Button>

            {currentState.items && (
              <div>
                <Select 
                  dropdownMatchSelectWidth
                  value={pageSize}
                  style={{ width: '100%', minWidth: 100, float: 'right', marginRight: 50, borderRadius: '15px' }}
                  onChange={(value: any) => onChangePage(1, value)}
                  >
                  <Option key={10} value={10}>
                    {t('Last 10 Grants')}
                  </Option>
                  <Option key={20} value={20}>
                    {t('Last 20 Grants')}
                  </Option>
                  <Option key={50} value={50}>
                    {t('Last 50 Grants')}
                  </Option>
                  <Option key={100} value={100}>
                    {t('Last 100 Grants')}
                  </Option>
                </Select>
              </div>
            )}
          </Row>
        </Col>
      </Row>
      <Spin spinning={currentState.isBusy.get()}>
        <Row align="top" justify="space-between" gutter={10} className={'grants-container'} 
          style={{ width: '100%', paddingRight: 20, paddingLeft: 30 }}
          >
          {currentState.items && currentState.items.length === 0 && (
            <Col span={24}>
              <Alert style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                message={t('No grants found with the selected criteria...')}
                showIcon
                type="warning"
              />
            </Col>
          )}
          {currentState.items && currentState.items.length > 0 &&
          currentState.items.get().map((item) => (
            <Col xs={12} md={12} sm={12}>
              {getGrantCard(item)}
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  )
}

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(GrantHistoryList)))))
