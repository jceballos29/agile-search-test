import { CalendarOutlined, ClearOutlined, HeartOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Col, Pagination, Row, Spin, Input, Alert, Select, Form } from 'antd'
import { FC, useEffect, useState, useRef } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import { GrantFilters, BuildFilters } from 'src/components/grant-filters'
import { GrantBriefSummary, GrantBriefSummaryStore } from 'src/stores/grant-store'
import { container } from 'src/inversify.config'
import { Query } from 'src/core/stores/data-store'
import { useHistory } from 'react-router-dom'
import { typeFilter } from 'src/utils/interfaces'
import AnnuitySelect from 'src/components/annuity-select'
import CountrySelect from 'src/components/country-select'
import LocationSelect from 'src/components/location-select'
import SectorSelect from 'src/components/sector-select'
import TypologySelect from '../../components/typology-select'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import ContentHeader from 'src/core/ui/content-header'
import Calendar from '../../components/calendar'
import NotificationsFeaturedMessages from 'src/components/notifications-featured-messages/notifications-featured-messages'
import './grant-card/grant-calendar-style.less'
import TargetSectorSelect from 'src/components/targetSector-select'
import HttpService from '../../core/services/http.service'
import { successNotification } from '../../components/systemNotification/notificationService'
const { Search } = Input
const { Option } = Select

interface GrantCalendarListProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps { }

const GrantFavoriteList: FC<GrantCalendarListProps> = (props) => {
    const { t, cache, identity, userProfile } = props
    const history = useHistory()
    const componentRef = useRef();

    const httpService = container.get(HttpService)
    const currentStore = container.get(GrantBriefSummaryStore)
    const currentState = currentStore.state

    const LoadFilter = (filter: string | null) => {
        let filterJSON: any = {};
        if (filter != null) filterJSON = JSON.parse(filter);
        filterJSON = cache.getWithCustomKey('grants-filter');
        const currentYear = new Date().getFullYear().toString();
        const currentAnnuity = userProfile.annuities.firstOrDefault(a => a.name === currentYear);
        if (filterJSON && !filterJSON.annuities && currentAnnuity) filterJSON.annuities = [{ value: currentAnnuity.id }];
        if (filterJSON && !filterJSON.status) filterJSON.status = [2];
        return filterJSON ?? ({
            status: [2],
            annuities: currentAnnuity ? [{ value: currentAnnuity.id }] : undefined,
        } as GrantFilters)
    }

    const [filter, setFilter] = useState(LoadFilter(new URL(window.location.href).searchParams.get('filter')))
    const [fullLoad, setFullLoad] = useState(false)

    const pageQuery = JSON.parse(new URL(window.location.href).searchParams.get('page') ?? '1')
    const [page, setPage] = useState(pageQuery)
    const pageSizeQuery = JSON.parse(new URL(window.location.href).searchParams.get('pageSize') ?? '10')
    const [pageSize, setPageSize] = useState(pageSizeQuery)

    const LoadSearchQuery = (filter: string | null) => {
        if (filter != null) return filter
        const storeQuery = cache.getWithCustomKey('grants-search')
        if (storeQuery) return storeQuery
        return storeQuery ?? ''
    }

    const [searchQuery, setSearchQuery] = useState<string | null>(LoadSearchQuery(new URL(window.location.href).searchParams.get('searchQuery')))
    const [grants, setGrants] = useState<GrantBriefSummary[]>([]);
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const [currentYearMin, setCurrentYearMin] = useState(new Date().getFullYear())
    const [currentYearMax, setCurrentYearMax] = useState(new Date().getFullYear() + 1)
    const [yearMin, setYearMin] = useState(null)
    const [yearMax, setYearMax] = useState(null)
    const [firstMonth, setFirstMonth] = useState<number | null>(null);

    const [selectedRows, setSelectedRows] = useState([])

    const NavigateToGrants = () => { history.push('/') }
    const NavigateToHistory = () => { history.push('/history') }
    const NavigateToFavorites = () => { history.push('/favorites') }

    const isAdmin =
        (props.identity.roles ? props.identity.roles : []).filter(
            (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
        )?.length > 0

    const onlyCountryViewer = (identity.roles ? identity.roles : [])
        .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin

    useEffect(() => {
        setFullLoad(true)
        load(buildQuery())
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const load = async (
        grantQuery: any,
        currentSearchQuery: string = searchQuery,
        currentPage: number = page,
        currentPageSize: number = pageSize
    ) => {
        setIsBusy(true);
        await currentStore.load(grantQuery as Query)
        const params = new URLSearchParams()
        filter ? params.append('filter', JSON.stringify(filter)) : params.delete('filter')
        currentSearchQuery ? params.append('searchQuery', currentSearchQuery) : params.delete(searchQuery)
        currentPage ? params.append('page', currentPage.toString()) : params.delete('page')
        currentPageSize ? params.append('pageSize', currentPageSize.toString()) : params.delete('pageSize')
        history.push({ search: params.toString() })
        let key = 0;
        setGrants(currentState.items.value.map(
            item => {
                return {
                    key: ((currentPage - 1) * 10) + key++,
                    ...item
                }
            })
        );
        setIsBusy(false);
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
                typologies: currentfilter.sectors && currentfilter.sectors.length > 0 ? currentfilter.sectors.map(t => t.value) : undefined
            },
        }
    }

    const onFilterChanges = (value: any, filterParam: string) => {
        const currentFilter = { ...filter }
        if (filterParam == typeFilter.status || filterParam == typeFilter.countries) {
            currentFilter[filterParam] = value.map((x: any) => ({ value: x }))
        }
        else {
            currentFilter[filterParam] = Array.isArray(value) ? value.map((x: any) => ({ value: x.value })) : value
        }

        if (filterParam == typeFilter.countries) currentFilter.locations = undefined
        setFilter(currentFilter)
        const currentQuery = buildQuery(1, pageSize, currentFilter)
        setPage(1)
        setSelectedRows([])
        load(currentQuery)
    }

    const onAnnuityChange = (value: any) => {
        switch (value.length) {
            case 0:
                setCurrentYearMin(new Date().getFullYear());
                setCurrentYearMax(new Date().getFullYear() + 1);
                setYearMin(null)
                setYearMax(null)
                setFirstMonth(1)
                break;
            case 1:
                setCurrentYearMin(Number(value[0].label));
                setCurrentYearMax(Number(value[0].label));
                setYearMin(Number(value[0].label))
                setYearMax(Number(value[0].label))
                setFirstMonth(1)
                break;
            default:
                let min = Math.min(...value.map((x: any) => Number(x.label)))
                let max = Math.max(...value.map((x: any) => Number(x.label)))
                setCurrentYearMin(Number(min));
                setCurrentYearMax(Number(max));
                setYearMin(min)
                setYearMax(max)
                setFirstMonth(1)
                break;
        }
        const currentFilter = filter
        currentFilter.annuities = value.map((x: any) => ({ value: x.value }))
        setFilter(currentFilter)
        setPage(1)
        const currentQuery = buildQuery(1, pageSize, currentFilter)
        setSelectedRows([])
        load(currentQuery)
    }

    const onChangePage = (newpage: any, newPageSize: any) => {
        const currentquery = buildQuery(newpage, newPageSize)
        setPage(newpage)
        setPageSize(newPageSize)
        load(currentquery, searchQuery, newpage, newPageSize)
    }

    const clearFilters = () => {
        let currentFilter = filter
        currentFilter = {}
        setFilter(currentFilter)
        setPage(1)
        setPageSize(10)
        cache.saveWithCustomKey('grants-search', '')
        const currentQuery = buildQuery(1, pageSize, currentFilter)
        setSearchQuery('')
        setSelectedRows([])
        load(currentQuery, searchQuery, 1, 10)
    }

    const onSearch = (value: string) => {
        setSearchQuery(value)
        setPage(1)
        const currentquery = buildQuery(1, pageSize, filter, value)
        cache.saveWithCustomKey('grants-search', value, true, true)
        setSelectedRows([])
        load(currentquery, value)
    }

    const onExport = async () => {
        await httpService.post(`api/v1/grants/ExportGrantsCalendar?`,
            {
                grantIds: selectedRows.map(r => r.id),
                startYear: currentYearMin,
                startMonth: firstMonth ?? 1
            })
        successNotification(t('Operation Completed Successfully'), t('Your operation will be processed in background'))
    }

    return (
        <div style={{ padding: 25 }}>
            <Row gutter={0}>

                <Col span={10}>
                    <ContentHeader hideBreadcrumb title={t('Calendar Grants')} showBack showBackLink="/" />
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
                        type="primary" style={{ float: 'right', marginRight: 10 }}
                        icon={<CalendarOutlined />}
                    >
                        {t("Calendar")}
                    </Button>

                    <Button
                        shape="round"
                        className={'fi-light-blue-button-new'}
                        onClick={() => NavigateToGrants()}
                        style={{ float: 'right', marginRight: 10 }}
                        icon={<SearchOutlined style={{ color: "#0000a4" }} />}
                    >
                        {t("Searcher")}
                    </Button>
                </Col>
            </Row>


            {/*FILTROS Y BOTONES*/}
            <Form>
                <Row className="filter-row">

                    <Col span={7}>
                        <label>{t('Criteria')}</label>
                        <Search
                            placeholder={t('Search criteria...')}
                            value={searchQuery}
                            onChange={(value) => setSearchQuery(value.target.value)}
                            onSearch={(value: any) => { onSearch(value) }}
                        />
                    </Col>

                    <Col span={3}>
                        <label>{t('Country')}</label>
                        <CountrySelect
                            nullable
                            mode={'multiple'}
                            placeholder={t('Any...')}
                            value={filter.countries}
                            onChange={(value) => onFilterChanges(value, typeFilter.countries)} />
                    </Col>

                    <Col span={4}>
                        <label>{t('Region')}</label>
                        <LocationSelect
                            fullLoad={fullLoad}
                            placeholder={t('Any...')}
                            value={filter.locations}
                            countries={filter.countries}
                            onChange={(value) => onFilterChanges(value, typeFilter.locations)} />
                    </Col>

                    <Col span={3}>
                        <label>{t('Annuity')}</label>
                        <AnnuitySelect
                            mode={'multiple'}
                            labelInValue={true}
                            placeholder={t('Any...')}
                            value={filter.annuities}
                            onChange={(value) => onAnnuityChange(value)} />
                    </Col>

                    <Col span={5}>
                        <label>{t('Beneficiary Type')}</label>
                        <BeneficiaryTypeSelect
                            mode={'multiple'}
                            placeholder={t('Any...')}
                            value={filter.bftypes}
                            onChange={(value) => onFilterChanges(value, typeFilter.bftypes)} />
                    </Col>

                    <Col span={4}>
                        <label>{t('Typologies')}</label>
                        <TypologySelect
                            mode={'multiple'}
                            value={filter.typologies}
                            placeholder={t('Any...')}
                            onChange={(value) => onFilterChanges(value, typeFilter.typologies)} />
                    </Col>

                    <Col span={4}>
                        <label>{t('Sectors')}</label>
                        <SectorSelect
                            mode={'multiple'}
                            value={filter.sectors}
                            placeholder={t('Any...')}
                            onChange={(value) => onFilterChanges(value, typeFilter.sectors)} />
                    </Col>

                    <Col span={4}>
                        <label>{t('Target Sectors')}</label>
                        <TargetSectorSelect
                            mode={'multiple'}
                            value={filter.targetSectors}
                            placeholder={t('Any...')}
                            onChange={(value) => onFilterChanges(value, typeFilter.targetSectors)} />
                    </Col>


                    <Col span={4}>
                        <label>{t('Category')}</label>
                        <Select
                            value={filter.category}
                            placeholder={t('Any...')}
                            dropdownMatchSelectWidth
                            allowClear
                            labelInValue
                            mode={"multiple"}
                            style={{ width: '100%', minWidth: 60 }}
                            onChange={(value: any) => onFilterChanges(value, typeFilter.category)}>
                            <Option key={'A'} value={1}> {t('Very important call')} </Option>
                            <Option key={'B'} value={2}> {t('Important call')} </Option>
                            <Option key={'C'} value={3}> {t('Reactive call')} </Option>
                            <Option key={'D'} value={4}> {t('Call not for companies')} </Option>
                            <Option key={'E'} value={5}> {t("FI doesn't work this call")} </Option>
                        </Select>
                    </Col>


                    <Col span={2}>
                        <label>{t('Status')}</label>
                        <Select
                            value={filter.status}
                            placeholder={t('Any...')}
                            allowClear
                            style={{ width: '100%', minWidth: 60 }}
                            mode={"multiple"}
                            onChange={(value: any) => onFilterChanges(value, typeFilter.status)}>
                            <Option key={0} value={0}>{t('Closed')}</Option>
                            <Option key={2} value={2}>{t('Open')}</Option>
                            <Option key={1} value={1}>{t('Pending publication')}</Option>
                        </Select>
                    </Col>

                    <Col span={2}>
                        <label>{t('Source')}</label>
                        <Select
                            placeholder={t('Any...')}
                            dropdownMatchSelectWidth
                            allowClear
                            value={filter.sources}
                            style={{ width: '100%', minWidth: 60 }}
                            onChange={(value: any) => onFilterChanges(value, typeFilter.sources)}>
                            <Option key={2} value={2}> {t('Public')} </Option>
                            <Option key={1} value={1}> {t('Private')} </Option>
                        </Select>
                    </Col>

                    <Col span={2}>
                        <label>{t('Minimis')}</label>
                        <Select
                            placeholder={t('Any...')}
                            dropdownMatchSelectWidth
                            allowClear
                            value={filter.minimis}
                            style={{ width: '100%', minWidth: 60 }}
                            onChange={(value: any) => onFilterChanges(value, typeFilter.minimis)}>
                            <Option key={1} value={1}> {t('Yes')} </Option>
                            <Option key={0} value={0}> {t('No')} </Option>
                        </Select>
                    </Col>

                </Row>
            </Form>


            <div className="button-row">

                <div style={{ display: 'flex', marginRight: '20%', marginTop: '5px' }}>
                    <div style={{ display: 'flex', marginRight: '20px' }}>
                        {`${t('Selected')} ${selectedRows.length} ${t('Items')}`}
                    </div>
                    <div style={{ display: 'flex', marginRight: '20px' }}>
                        <div style={{ background: 'rgb(0,0,164)', borderRadius: '50%', width: '15px', height: '15px', marginTop: '5%', marginRight: '5px' }}></div>
                        <span>{t('Open')}</span>
                    </div>
                    <div style={{ display: 'flex', marginRight: '20px' }}>
                        <div style={{ background: '#AD0274', borderRadius: '50%', width: '15px', height: '15px', marginTop: '5%', marginRight: '5px' }}></div>
                        <span>{t('Closed')}</span>
                    </div>
                    <div style={{ display: 'flex', marginRight: '20px' }}>
                        <div style={{ background: '#EFAC14', borderRadius: '50%', width: '15px', height: '15px', marginTop: '2%', marginRight: '5px' }}></div>
                        <span>{t('PendingPublication')}</span>
                    </div>
                </div>

                <Button onClick={() => clearFilters()} style={{ marginRight: 30, float: 'right' }} icon={<ClearOutlined />}>
                    {t('Clear') + ' '}
                </Button>

                <Button type="primary" onClick={() => load(buildQuery())} style={{ float: 'right', marginRight: 30 }} icon={<SearchOutlined />}>
                    {t('Search')}
                </Button>

                <Button type="primary" onClick={() => onExport()} style={{ float: 'right', marginRight: 30 }}>
                    {t('Export PDF')}
                </Button>

                {currentState.items && (
                    <div>
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
                )}

            </div>

            <Spin spinning={isBusy}>
                <div className="main-calendar">
                    {/*EN CASO DE QUE NO HAYA ITEMS*/}
                    {!grants || grants.length == 0 ? (
                        <Col span={24}>
                            <Alert
                                style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                                message={t('No grants found with the selected criteria...')}
                                showIcon
                                type="warning"
                            />
                        </Col>
                    ) :
                        <Calendar
                            componentRef={componentRef}
                            currentYearMin={currentYearMin}
                            setCurrentYearMin={setCurrentYearMin}
                            currentYearMax={currentYearMax}
                            setCurrentYearMax={setCurrentYearMax}
                            grants={grants}
                            yearMin={yearMin}
                            yearMax={yearMax}
                            firstMonth={firstMonth}
                            setFirstMonth={setFirstMonth}
                            setSelectedRows={setSelectedRows}
                            selectedRows={selectedRows}
                        />
                    }
                </div>
            </Spin>
        </div >
    )
}

export default withIdentity(withCache(withTranslation()(withUserProfile(withRouter(GrantFavoriteList)))))
