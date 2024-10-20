import React, { FC, useEffect, useReducer, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { container } from 'src/inversify.config'
import { Button, Card, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select, Modal, Checkbox } from 'antd'
import debounce from 'lodash/debounce'
import { Query } from 'src/core/stores/data-store'
import { GrantBriefSummaryStore } from 'src/stores/grant-store'
import { BuildFilters, GrantFilters } from './grant-filters'
import AnnuitySelect from 'src/components/annuity-select'
import CountrySelect from 'src/components/country-select'
import LocationSelect from 'src/components/location-select'
import SectorSelect from 'src/components/sector-select'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import { UserProfileProps, withUserProfile } from 'src/components/user-profile'
import { CalendarOutlined, ClearOutlined, FormOutlined, LockOutlined, SearchOutlined, UnlockOutlined } from '@ant-design/icons'
import { GetFlag } from './flags-icons'
const { Search } = Input
const { Option } = Select

interface GrantSelectProps extends WithTranslation, UserProfileProps {
  onClose: () => void
  onAddGrants: (items: any[]) => void
  excludeGrantsFilter: number[]
  countrySelected?: string
}

const GrantSelect: FC<GrantSelectProps> = (props) => {
  const { t, onClose, onAddGrants, excludeGrantsFilter, userProfile, countrySelected } = props

  const [filter, setFilter] = useState({ countryId: countrySelected } as GrantFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrants, setSelectedGrants] = useState<string[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const [, setQuery] = useState({
    searchQuery: '',
    skip: 0,
    take: 6,
    parameters: {
      exclude: excludeGrantsFilter,
    },
  })

  const currentStore = container.get(GrantBriefSummaryStore)
  const currentState = currentStore.state

  useEffect(() => {
    load(buildQuery())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async (grantQuery: any) => {
    await currentStore.load(grantQuery as Query)
  }

  const buildQuery = (
    currentpage: number = page,
    currentpageSize: number = pageSize,
    currentfilter: GrantFilters = filter,
    search: string = searchQuery,
    excludeFilter: number[] = excludeGrantsFilter
  ) => {
    return {
      searchQuery: search,
      skip: (currentpage - 1) * currentpageSize,
      take: currentpageSize,
      filter: BuildFilters(currentfilter),
      parameters: {
        exclude: excludeFilter,
      },
    }
  }
  const onSectorChanges = (value: any) => {
    var currentFilter = filter
    currentFilter.sectors = value.map((x: any) => ({ value: x.value }))
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }

  const onAnnuityChange = (value: any) => {
    var currentFilter = filter
    currentFilter.annuities = value.map((x: any) => ({ value: x.value }))
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }


  const onLocationChanges = (value: any[]) => {
    var currentFilter = filter
    currentFilter.locations = value.map((x: any) => ({ value: x.value }))
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }

  const onChangePage = (newpage: any, newPageSize: any) => {
    var currentquery = buildQuery(newpage, newPageSize)
    setQuery(currentquery)
    setPage(newpage)
    setPageSize(newPageSize)
    load(currentquery)
  }
  const onSearch = debounce((value: string) => {
    setSearchQuery(value)
    setPage(1)
    var currentquery = buildQuery(1, pageSize, filter, value)
    setQuery(currentquery)
    load(currentquery)
  }, 10)

  const onChangeMinimis = (value: any) => {
    var currentFilter = filter
    currentFilter.minimis = value
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }

  const onChangeSource = (value: any) => {
    var currentFilter = filter
    currentFilter.sources = value
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }

  const onChangeStatus = (value: any) => {
    var currentFilter = filter
    currentFilter.status = value.map((x: any) => ({ value: x.value }))
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }

  const onBFChanges = (value: any) => {
    var currentFilter = filter
    currentFilter.bftypes = value.map((x: any) => ({ value: x.value }))
    setFilter(currentFilter)
    setPage(1)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setQuery(currentQuery)
    load(currentQuery)
  }

  const reLoad = () => {
    load(buildQuery())
  }
  const clearFilters = () => {
    var currentFilter = filter
    currentFilter = {countryId: countrySelected} as GrantFilters
    setFilter(currentFilter)
    setPage(1)
    setPageSize(10)
    var currentQuery = buildQuery(1, pageSize, currentFilter)
    setSearchQuery('')
    setQuery(currentQuery)
    load(currentQuery)
  }

  const getTitle = (item: any) => {
    if (!item) return <div></div>
    return <Tooltip title={item.title}> {item.title.slice(0, 80) + (item.title.length > 80 ? '...' : '')}</Tooltip>
  }
  const onSelect = (id: string) => {
    var list = selectedGrants
    if (list.any((t) => t === id)) {
      list = list.filter((t) => t !== id)
    } else {
      list.push(id)
    }
    forceUpdate()
    setSelectedGrants(list)
  }

  const getIconCountryById = (countryId: string) => {
    const countries = userProfile.countries.filter(c => c.code === countryId)
    return countries[0]?.icon
  }

  const getGrantCard = (item: any) => {
    if (!item) return <div></div>

    return (
      <Card
        className={'grant-item-container'}
        style={{ marginBottom: 10 }}
        extra={<span style={{ marginRight: 10 }}>{GetFlag(item.countryId, getIconCountryById(item.countryId))}</span>}
        title={
          <a className={'fi-light-blue-color'} onClick={() => onSelect(item.id)}>
            <Tooltip title={t('Select/UnSelect')}>
              <Checkbox style={{ float: 'left', marginRight: 10 }} checked={selectedGrants.any((t) => t === item.id)}></Checkbox>
            </Tooltip>
            {item.status === 'Closed' && (
              <Tooltip title={t('Closed')}>
                <Tag color="red" style={{ float: 'left' }}>
                  <LockOutlined />
                </Tag>
              </Tooltip>
            )}
            {item.status === 'Open' && (
              <Tooltip title={t('Open')}>
                <Tag color="green" style={{ float: 'left' }}>
                  <UnlockOutlined />
                </Tag>
              </Tooltip>
            )}
            {item.status === 'PendingPublication' && (
              <Tooltip title={t('Pending Publication')}>
                <Tag color="warning" style={{ float: 'left' }}>
                  <FormOutlined />
                </Tag>
              </Tooltip>
            )}
            {getTitle(item)}
            {item.annuity && (
              <span style={{ marginLeft: 10 }}>
                {' '}
                <Tooltip title={t('Annuity')}>
                  <Tag color="gold">
                    <CalendarOutlined style={{ marginRight: 5 }} />
                    {item.annuity}
                  </Tag>
                </Tooltip>
              </span>
            )}
          </a>
        }

      >
        <Row>
          <Col span={24}>
            {item.countryId !== 'es' && <p>{item.description ? item.description.replace(/<\/?[^>]+(>|$)/g, '(...)') : ''}</p>}

            <p>
              {item.deadline && (
                <Tooltip title={t('Deadline')}>
                  <Tag color="geekblue">
                    <CalendarOutlined style={{ marginRight: 5 }} />
                    {item.deadline}
                  </Tag>
                </Tooltip>
              )}
            </p>
          </Col>
        </Row>
      </Card>
    )
  }

  return (
    <Modal
      className={'grant-select'}
      style={{ top: 10 }}
      width={'80%'}
      maskClosable={true}
      title={t('Add Featured Grant/s')}
      visible={true}
      onOk={() => onAddGrants(selectedGrants)}
      onCancel={() => onClose()}
      okText={t('Add Featured Grants')}
      cancelText={t('Cancel')}
    >
      <Row gutter={16} className="grants-filters">

        <Col span={9}>
          <label>{t('Criteria')}</label>
          <Search
            placeholder={t('Search criteria...')}
            value={searchQuery}
            onChange={(value) => setSearchQuery(value.target.value)}
            onSearch={(value: any) => onSearch(value)}
          />
        </Col>

        <Col span={4}>
          <label>{t('Country')}</label>
          <CountrySelect value={filter.countryId} disabled={true}/>
        </Col>

        <Col span={8} className={'filter-avatar'}>
          <label>{t('Locations')}</label>
          <LocationSelect fullLoad={true} placeholder={t('All')} value={filter.locations} countryId={filter.countryId} onChange={(value) => onLocationChanges(value)} />
        </Col>

        <Col span={3}>
          <label>{t('Annuity')}</label>
          <AnnuitySelect mode={'multiple'} labelInValue={true} placeholder={t('All')} value={filter.annuities} onChange={(value) => onAnnuityChange(value)} />
        </Col>

        <Col span={9}>
          <label>{t('Sectors')}</label>
          <SectorSelect mode={'multiple'} value={filter.sectors} placeholder={t('All')} onChange={(value) => onSectorChanges(value)} />
        </Col>

        <Col span={6}>
          <label>{t('Beneficiary Type')}</label>
          <BeneficiaryTypeSelect mode={'multiple'} placeholder={t('All')} value={filter.bftypes} onChange={(value) => onBFChanges(value)} />
        </Col>

        <Col span={3}>
          <label>{t('Source')}</label>
          <Select
            placeholder={t('All')}
            dropdownMatchSelectWidth
            allowClear
            value={filter.sources}
            style={{ width: '100%', minWidth: 60 }}
            onChange={(value: any) => onChangeSource(value)}
          >
            <Option key={2} value={2}> {t('Public')} </Option>
            <Option key={1} value={1}> {t('Private')} </Option>
          </Select>
        </Col>

        <Col span={3}>
          <label>{t('Status')}</label>
          <Select
            value={filter.status}
            placeholder={t('All')}
            dropdownMatchSelectWidth
            allowClear
            labelInValue
            mode={"multiple"}
            style={{ width: '100%', minWidth: 60 }}
            onChange={(value: any) => onChangeStatus(value)}
          >
            <Option key={1} value={1}> {t('Closed')} </Option>
            <Option key={2} value={2}> {t('Open')} </Option>
            <Option key={3} value={3}> {t('Pending publication')} </Option>
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
            onChange={(value: any) => onChangeMinimis(value)}
          >
            <Option key={1} value={1}> {t('Yes')} </Option>
            <Option key={0} value={0}> {t('No')} </Option>
          </Select>
        </Col>

        <Col span={24} style={{ marginTop: 10, paddingRight: 20 }}>
          <Row gutter={20} style={{ float: 'right' }}>
            <Button onClick={() => clearFilters()} style={{ marginRight: 30, float: 'right' }} icon={<ClearOutlined />}>
              {t('Clear') + ' '}
            </Button>
            <Button type="primary" onClick={() => reLoad()} style={{ float: 'right', marginRight: 30 }} icon={<SearchOutlined />}>
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
        <Row gutter={10} style={{}}>

          {currentState.get().items && currentState.get().items.length === 0 && (
            <Col span={24}>
              <Alert
                style={{ width: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
                message={t('No grants found with the selected criteria...')}
                showIcon
                type="warning"
              />
            </Col>
          )}

          {currentState.get().items && currentState.get().items.length > 0 &&
            currentState.items.get().map((item) => (
              <Col xs={12} md={12} sm={24} style={{ padding: 10 }}>
                {getGrantCard(item)}
              </Col>
            ))}

          <Col span={24}>
            {currentState.get().items && currentState.get().items.length > 0 && (
              <div style={{ float: 'right', marginBottom: 20, marginTop: 20 }}>
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
          </Col>

        </Row>
      </Spin>

    </Modal>
  )
}

export default withUserProfile(withTranslation()(GrantSelect))
