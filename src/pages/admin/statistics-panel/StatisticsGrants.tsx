import { Select, Tag, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'
import { container } from '../../../inversify.config'
import { withTranslation, WithTranslation } from 'react-i18next'
import { StatisticSummary, StatisticsStore } from 'src/stores/statistics-store'
import { UserProfileProps, withUserProfile } from '../../../components/user-profile'
import { Query, QueryParameters } from '../../../core/stores/data-store'
import { formatMessage } from '../../../core/services/http.service'
import { CacheProps } from '../../../core/services/cache.service';
import { TableView } from '../../../core/ui/collections/table'
import CountrySelect from '../../../components/country-select'
import { ShowCountryFlag } from 'src/components/flags-icons'
import { EyeOutlined, FilePptOutlined, DownloadOutlined, AppstoreOutlined } from '@ant-design/icons'
const { Option } = Select

interface StatisticsGrantsProps extends WithTranslation, UserProfileProps, CacheProps { }

const StatisticsGrants: FC<StatisticsGrantsProps> = (props) => {
  const { t } = props;
  const currentStore = container.get(StatisticsStore);
  const currentState = currentStore.state;

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [initPagination, setInitPagination] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const [countries] = useState(props.userProfile.countries)

  const [filterCountryId, setFilterCountryId] = useState(undefined)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('')

  const [query, setQuery] = useState({
    searchQuery: searchQuery,
    orderBy: [{ field: 'views', direction: 'Descending', useProfile: false }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    parameters: {
      'countryId': filterCountryId,
      'category': filterCategory
    } as QueryParameters,
  } as unknown as Query);

  const Load = (searchQuery: Query = query) => {
    currentStore.load(searchQuery)
  }

  useEffect(() => {
    setPage(1)
    query.searchQuery = ''
    query.skip = (page - 1) * pageSize
    query.take = pageSize
    query.parameters = {
      'countryId': filterCountryId,
      'category': filterCategory,
      'period': filterPeriod,
    } as QueryParameters
    Load()
  }, [filterCountryId, filterCategory, filterPeriod, t]) // eslint-disable-line react-hooks/exhaustive-deps  

  useEffect(() => {
    Load();
  }, [query]);

  const leftToolBar = () => (
    <div className="container-header">
      <Select
        placeholder={t('Filter by Category')}
        dropdownMatchSelectWidth
        allowClear
        labelInValue
        onChange={(value: any) => setFilterCategory(value?.key)}
      >
        <Option key={'A'} value={1}>{t('A')}</Option>
        <Option key={'B'} value={2}>{t('B')}</Option>
        <Option key={'C'} value={3}>{t('C')}</Option>
        <Option key={'D'} value={4}>{t('D')}</Option>
        <Option key={'E'} value={5}>{t('E')}</Option>
      </Select>

      <CountrySelect
        nullable
        placeholder={t('Filter by Country')}
        value={filterCountryId}
        onChange={(value) => setFilterCountryId(value)}
        minWidth={200}
      />

      <Select
        placeholder={t('Filter by Period')}
        style={{ width: 200 }}
        dropdownMatchSelectWidth
        allowClear
        labelInValue
        onChange={(value: any) => setFilterPeriod(value?.key)}
      >
        <Option key={'LastYear'} value={1}>{t('Last Year')}</Option>
        <Option key={'LastMonth'} value={2}>{t('Last Month')}</Option>
        <Option key={'LastWeek'} value={3}>{t('Last Week')}</Option>
        <Option key={'Today'} value={4}>{t('Last 24 Hours')}</Option>
      </Select>
    </div>
  )

  const statisticsModel = {
    query: query,
    columns: [
      {
        sortable: true,
        searcheable: true,
        field: 'id',
        title: t('Id'),
        renderer: (value: StatisticSummary) => (
          <span style={{ cursor: 'pointer' }}>
            {value.id}
          </span >
        ),
        fixed: 'left',
        width: '85px'
      },
      {
        searcheable: true,
        field: 'title',
        title: t('Title'),
        renderer: (value: StatisticSummary) => (
          <span style={{ cursor: 'pointer' }}>
            <span style={{ marginRight: 10 }}>{ShowCountryFlag(value.countryId, countries)}</span>
            <Tooltip title={value.title}>
              {
                value.title ?
                  ` ${value.title?.slice(0, 100)} ${value.title?.length > 100 ? '...' : ''}` :
                  'No Title or Description Provided'
              }
            </Tooltip>
          </span >
        ),
        fixed: 'left',
        width: '200px'
      },
      {
        field: 'category',
        searcheable: false,
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Category')} <AppstoreOutlined /></span>,
        renderer: (value: StatisticSummary) => <Tag color={'green'}>{t(value.category)}</Tag>,
        width: '85',
      },
      {
        sortable: true,
        searcheable: false,
        field: 'views',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Views')} <EyeOutlined /></span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.views}</span>,
      },
      {
        field: 'downloadIDCard',
        sortable: true,
        searcheable: false,
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Slides')} <FilePptOutlined /></span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.idCardDownload}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentSummary',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Summary')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentSummary}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentPresentation',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Presentations')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentPresentation}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentJustification',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Justification Templates')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentJustification}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentRequest',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Request templates')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentRequest}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentFaqs',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('FAQs')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentFaqs}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentCall',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Call')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentCall}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentRegulatoryBase',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Regulatory bases')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentRegulatoryBase}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentModification',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Modifications')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentModification}</span>,
      },
      {
        sortable: true,
        searcheable: false,
        field: 'documentResolution',
        title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Resolutions')} <DownloadOutlined /> </span>,
        width: '85px',
        renderer: (value: StatisticSummary) => <span>{value.documentResolution}</span>,
      }
    ],
    data: currentState.value,
    sortFields: [],
  }

  return (
    <TableView
      rowKey={'id'}
      onRefresh={() => Load()}
      leftToolbar={leftToolBar()}
      initPagination={initPagination}
      onQueryChanged={(query: Query) => setQuery(query)}
      model={statisticsModel}
      error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
    />
  )
}

export default withUserProfile(withTranslation()(StatisticsGrants))