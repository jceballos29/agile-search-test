import { withTranslation, WithTranslation } from 'react-i18next'
import React, { FC, useEffect, useState } from 'react'
import { container } from '../../../inversify.config'
import HttpService, { formatMessage } from '../../../core/services/http.service'
import { GrantFile, GrantItem, GrantItemStore, GrantStatus, GrantSummary, GrantSummaryStore, PublicationType, SourceType, hasSource } from '../../../stores/grant-store'
import { Alert, Button, Space, Card, Form, message, Modal, Row, Select, Spin, Switch, Tag, Tooltip } from 'antd'
import { TableView } from '../../../core/ui/collections/table'
import { GetFlag } from '../../../components/flags-icons'
import CountrySelect from '../../../components/country-select'
import { BuildFilters, GrantFilters } from '../../../components/grant-filters'
import { Query } from '../../../core/stores/data-store'
import AnnuitySelect from '../../../components/annuity-select'
import { formatDate } from '../../../core/utils/object'
import { IdentityProps } from '../../../core/services/authentication'
import './bin-style.less'

const { Option } = Select


interface PublicationControlHomeProps extends WithTranslation, IdentityProps, Reloader { }

interface Reloader {
  reloadTab?: Boolean
}

const PublicationControl: FC<PublicationControlHomeProps> = (props) => {
  const { t, identity, reloadTab } = props

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState({} as GrantFilters)
  const [loading, setLoading] = useState(false)

  const [pubParam, setPubParam] = useState(2)

  const [initPagination, setInitPagination] = useState(false)
  const [selectedRows, setSelectedRows] = useState<any[]>([])



  const [query, setQuery] = useState({
    searchQuery: searchQuery,
    skip: (page - 1) * pageSize,
    take: pageSize,
    parameters: {
      published: pubParam,
      deleted: true
    },
  } as unknown as Query)

  const httpService = container.get(HttpService)
  const currentStore = container.get(GrantSummaryStore)
  const currentState = currentStore.state


  let timer = null


  useEffect(() => {
    setLoading(true)
    clearTimeout(timer)
    timer = setTimeout(() => {
      Load(query)
      setLoading(false)
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [query, reloadTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const Load = (searchQuery: Query = query) => {
    searchQuery.filter = BuildFilters(filter)
    console.log(searchQuery)
    currentStore.load(searchQuery)
  }

  //Filters
  const onCountryChange = (value: any) => {
    const currentFilter = filter
    currentFilter.countryId = value
    setFilter(currentFilter)
    setPage(1)
    setInitPagination(true)
    query.skip = (page - 1) * pageSize
    Load(query)
  }

  const onAnnuityChange = (value: any) => {
    const currentFilter = filter
    currentFilter.annuities = value.map((x: any) => ({ value: x.value }))
    setFilter(currentFilter)
    setPage(1)
    setInitPagination(true)
    query.skip = (page - 1) * pageSize
    Load(query)
  }


  //Valid for Restore Grant

  const ValidRestore = (rowKeys: any[]): boolean => {
    const selectedItems = currentState.value.items.filter((i) => rowKeys.includes(i.id))
    const valid = selectedItems.all((i) => !i.published)

    return valid && selectedItems.length > 0
  }

  //Function Restore Grant 
  const DeleteGrant = async (status: boolean) => {
    setLoading(true)

    const result = await httpService.post('api/v1/grants/deleted', {
      deleted: status,
      grantids: selectedRows,
    })

    if (result && !status) {
      message.success(t('Grants successfully restored'))
    }

    Load()
    setLoading(false)
  }


  //Function Bar
  const leftToolBar = () => (
    <>
      <div className="container-header">

        {ValidRestore(selectedRows) && (
          <Button
            type="primary"
            onClick={() => DeleteGrant(false)}
            loading={loading}
            style={{
              minWidth: loading ? 200 : 170,
              padding: '0px 5px',
            }}
          >
            {t('Restore')}
          </Button>
        )}

        <CountrySelect
          nullable
          placeholder={t('Filter by Country')}
          value={filter.countryId}
          onChange={(value) => {
            onCountryChange(value)
          }}
          minWidth={200}
        />
        <AnnuitySelect
          mode={'multiple'}
          labelInValue={true}
          placeholder={t('Filter by Annuity')}
          value={filter.annuities}
          onChange={(value) => {
            onAnnuityChange(value)
          }}
          minWidth={200}
        />

      </div>

    </>
  )


  const grantTableModel = {
    query: query,
    columns: [

      {
        sortable: true,
        searcheable: true,
        field: 'title',
        title: t('Title'),
        renderer: (value: GrantSummary) => (
          <span style={{ cursor: 'pointer' }}>

            <span style={{ marginRight: 10 }}>{GetFlag(value.countryId, value.countryIcon)}</span>

            <Tooltip title={value.title}>
              {value.title && value.title?.slice(0, 100) + (value.title?.length > 100 ? '...' : '')}
              {!value.title && value.description && value.description?.slice(0, 100) + (value.description?.length > 100 ? '...' : '')}
              {!value.description && !value.title && 'No Title or Description Provided'}
            </Tooltip>
          </span>
        ),
      },
      {
        field: 'openningDate',
        sortable: true,
        searcheable: false,
        title: t('Opening Date'),
        renderer: (value: GrantSummary) => <span>{value.openningDate && formatDate(value.openningDate)}</span>,
      },
      {
        field: 'modifiedOn',
        sortable: false,
        searcheable: false,
        title: t('Modified On'),
        renderer: (value: GrantSummary) => <span>{value.modifiedOn && formatDate(value.modifiedOn)}</span>,
      },
      {
        sortable: false,
        searcheable: false,
        field: 'annuity',
        title: t('Annuities'),
        renderer: (value: GrantSummary) => value.annuities.map(x => <Tag color={'red'} > {x.name}</Tag>),
      }
    ],
    data: currentState.value,
    sortFields: [],
  }


  return (
    <>
      {!loading &&

        <Card title={t('Publication Control')}>
          <Row align={'middle'} justify={'space-between'}>
            <div style={{ width: '100%', marginBottom: '0 10px', overflow: 'hidden' }}>
              <TableView
                canSelect
                rowKey={'id'}
                leftToolbar={leftToolBar()}
                initPagination={initPagination}
                onQueryChanged={(query: Query) => {
                  // @ts-ignore
                  setSearchQuery(query.parameters.$search)
                  setQuery(query)
                  //setFirst(false)
                  /*Load(query);*/
                }}
                onSelectedChange={(rowKeys: any[]) => {
                  setSelectedRows(rowKeys)
                  ValidRestore(rowKeys)
                }}
                onRefresh={() => Load()}
                model={grantTableModel}
                error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
              />

            </div>


          </Row>
        </Card>
      }
    </>
  )
}

export default withTranslation()(PublicationControl)
