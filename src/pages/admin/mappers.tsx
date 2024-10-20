import Icon, {
  CalendarOutlined,
  CaretRightOutlined,
  ClearOutlined,
  CloudDownloadOutlined,
  EnvironmentOutlined,
  LockOutlined,
  NotificationOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import ContentHeader from 'src/core/ui/content-header'

import FormItem from 'antd/lib/form/FormItem'
import { container } from 'src/inversify.config'
import { Query } from 'src/core/stores/data-store'
import { DimensionMapperSummaryDataStore, DimensionMapperItem, DimensionMapperItemDataStore } from 'src/stores/dimension-mapper-store'
import debounce from 'lodash/debounce'
import HttpService, { formatMessage } from '../../core/services/http.service'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { GetFlag, GetImageFlag } from '../../components/flags-icons'
import { useHistory } from 'react-router-dom'
import { TableView } from '../../core/ui/collections/table'
import { formatDate } from '../../core/utils/object'
import Store from '../../core/stores/store'
import SectorSelect from 'src/components/sector-select'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import CountrySelect from 'src/components/country-select'
import TypologySelect from '../../components/typology-select'
const { Search } = Input
const { Option } = Select

export interface DimensionMapperFilter {
  countryCode?: string
  dimensionType?: string
}

export function BuildFilters(pfilters: DimensionMapperFilter): any[] {
  let filters: any[] = []
  if (pfilters) {
    //country
    if (pfilters.countryCode) {
      filters.push({
        countryCode: { eq: pfilters.countryCode },
      })
    }
    //type
    if (pfilters.dimensionType) {
      filters.push({
        dimensionType: { eq: pfilters.dimensionType },
      })
    }
  }
  return filters
}
interface DimensionMapHomeProps extends WithTranslation, RouteComponentProps, CacheProps { }

const DimensionMapHome: FC<DimensionMapHomeProps> = (props) => {
  const { t, cache } = props
  const history = useHistory()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [initPagination, setInitPagination] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState({} as DimensionMapperFilter)

  useEffect(() => {
    Load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [query, setQuery] = useState({
    searchQuery: '',
    orderBy: [{ field: 'id', direction: 'Ascending', useProfile: false }],
    skip: 0,
    take: 10,
  } as Query)

  const httpService = container.get(HttpService)
  const currentStore = container.get(DimensionMapperSummaryDataStore)
  const currentState = currentStore.state

  const EditData = (data: DimensionMapperItem) => {
    if (data.dimensionType == 'Sector') {
      return <SectorSelect mode={'multiple'} />
    } else if (data.dimensionType == 'Typology') { return <TypologySelect mode='multiple' /> }
    else return <BeneficiaryTypeSelect mode={'multiple'} />
  }

  const Load = (currentQuery: Query = query, currentFilter: DimensionMapperFilter = filter) => {
    currentQuery.filter = BuildFilters(currentFilter)
    currentStore.load(currentQuery)
  }

  const onCountryChanges = (value: any) => {
    var currentFilter = filter
    setPage(1)
    setInitPagination(true)
    query.skip = (page - 1) * pageSize
    currentFilter.countryCode = value
    setFilter(currentFilter)
    Load(query, currentFilter)
  }

  const onChnageType = (value: any) => {
    var currentFilter = filter
    setPage(1)
    setInitPagination(true)
    query.skip = (page - 1) * pageSize
    currentFilter.dimensionType = value
    setFilter(currentFilter)
    Load(query, currentFilter)
  }

  const renderLeftToolbar = () => (
    <>
      <CountrySelect nullable placeholder={t('Filter Country')} value={filter.countryCode} onChange={(value) => onCountryChanges(value)} minWidth={200} />
      <Select
        value={filter.dimensionType}
        placeholder={t('Filter Type')}
        dropdownMatchSelectWidth
        allowClear
        style={{ width: '100%', minWidth: 200, marginLeft: 20 }}
        onChange={(value: any) => onChnageType(value)}
      >
        <Option key={'Typology'} value={'Typology'}>
          {t('Typology')}
        </Option>
        <Option key={'Sector'} value={'Sector'}>
          {t('Sector')}
        </Option>
        <Option key={'BeneficiaryType'} value={'BeneficiaryType'}>
          {t('Beneficiary Types')}
        </Option>
      </Select>
    </>
  )

  const getColor = (type: string) => {
    if (type == "Sector") return "green";
    if (type == "Typology") return "blue"
    return "yellow"

  }
  const notificationTableModel = {
    query: query,
    columns: [
      {
        sortable: true,
        searcheable: true,
        field: 'dimensionName',
        title: t('Dimension Name'),
        renderer: (data: DimensionMapperItem) => (
          <span>
            <span style={{ marginRight: 10 }}>{GetFlag(data.countryCode, data.countryIcon)}</span>
            {data.dimensionName}
          </span>
        ),
      },
      {
        sortable: false,
        field: 'dimensionType',
        title: t('Type'),
        renderer: (data: DimensionMapperItem) => (
          <span>
            <Tag color={getColor(data.dimensionType)}>{t(data.dimensionType)}</Tag>
          </span>
        ),
      },
      {
        sortable: false,
        field: 'mappers',
        title: t('Dimension Map'),
        renderer: (data: DimensionMapperItem) => (
          <span>
            {data.mappers.length > 0 ? (
              data.mappers.map((x) => <Tag color={getColor(data.dimensionType)}>{t(x.label)}</Tag>)
            ) : (
              <Tag color={'rgb(164,0,0)'}>{t('Not Mapped')}</Tag>
            )}
          </span>
        ),
        editor: (data: DimensionMapperItem) => EditData(data),
      },
    ],
    data: currentState.value,
    sortFields: [],
  }

  const handleSave = async (item: any, itemState: any) => {
    const result = await currentStore.update(item.id, { dimensionsIds: item.mappers.map((x) => x.value) })
    await currentStore.load(query)
    return result
  }

  return (
    <Card title={t('Dimension Mappers')}>
      <Row align="middle" justify="space-between">
        <div style={{ width: '100%', margin: '0 5px', overflow: 'hidden' }}>
          <TableView
            canEdit
            canDelete={true}
            initPagination={initPagination}
            onDeleteRow={(record: any) => currentStore.delete(record.id)}
            rowKey="id"
            onSaveRow={handleSave}
            onQueryChanged={(query: Query) => {
              setQuery(query)
              Load(query)
            }}
            leftToolbar={renderLeftToolbar()}
            onRefresh={() => Load()}
            model={notificationTableModel}
            error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
          />
        </div>
      </Row>
    </Card>
  )
}

export default withCache(withTranslation()(withRouter(DimensionMapHome)))
