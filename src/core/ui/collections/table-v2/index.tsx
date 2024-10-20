import React, { useState, useEffect, useRef } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import {
  Table as AntTable,
  Row,
  Popconfirm,
  Spin,
  FormInstance,
  Alert,
  Col,
  Tooltip,
  Button,
  Select,
  Input,
  CheckboxProps,
  Dropdown,
  Menu,
  Modal,
} from 'antd'
import {
  SaveOutlined,
  UndoOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DownOutlined,
  CheckOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { Query, ListState, SortDirection } from 'src/core/stores/data-store'
import { CommandResult } from 'src/core/stores/types'
import { EditableCell, EditableFormRow, EditableContext } from './editable-row'
import { FilterComponent } from './filter-component'
import { clone } from 'src/core/utils/object'
import { ColumnType, TablePaginationConfig } from 'antd/lib/table'
import { SizeMeProps, withSize } from 'react-sizeme'
import { FilterValue, SorterResult, TableCurrentDataSource, TableRowSelection } from 'antd/lib/table/interface'
import './index.less'

export interface TableSortFieldDefinition {
  field: string
  text: string
  useProfile: boolean
}

export interface TableColumn<T> {
  field: string
  title: string
  visible?: boolean
  searchable?: boolean
  required?: boolean
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  sortField?: string
  useProfile?: boolean
  filter?: React.ReactNode
  filterField?: string
  filterByQueryString?: boolean
  headerRenderer?: () => React.ReactNode
  renderer?: (item: T) => React.ReactNode
  editorValuePropName?: string
  editor?: (item: T) => React.ReactNode
  width?: any
  fixed?: boolean | 'left' | 'right'
  optional?: boolean
}

export interface TableModel<T> {
  query: Query
  columns: TableColumn<T>[]
  data: ListState<T>
  sortFields?: TableSortFieldDefinition[]
}

export interface TableProps<T extends any> extends WithTranslation, SizeMeProps {
  addNewLabel?: string;
  error?: string
  title?: string | React.ReactNode
  rowKey?: keyof T
  small?: boolean
  embedded?: boolean
  headerMarginRight?: number
  headerMarginLeft?: number
  model: TableModel<T>
  onQueryChanged: (query: Query) => void

  onRefresh?: () => void
  canCreateNew?: boolean
  onNewItem?: () => void
  canEdit?: boolean
  onSaveRow?: (item: T) => Promise<CommandResult<any>>
  canDelete?: boolean
  onDeleteRow?: (item: T) => Promise<CommandResult<any>>

  canSort?: boolean
  canSelect?: boolean
  canSelectRow?: (item: T) => boolean
  onSelectedChange?: (rowKeys: any[]) => void

  onRowClick?: (item: T) => void
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>
  rowClassName?: string | ((record: T, index: number) => string)

  searchText?: string
  searchWidth?: number
  rightToolbar?: React.ReactNode
  leftToolbar?: React.ReactNode
  tableHeader?: React.ReactNode
  hideFilter?: boolean
  hideRefresh?: boolean
  hidePagination?: boolean
  showPaginationOnTop?: boolean
  pageSize?: number
  pageSizeOptions?: string[]
  editColumnFixed?: boolean;

  hideContent?: boolean
  leftToolbarSpan?: number
  rightToolbarSpan?: number
  // bulkTemplateUrl?: string;
  // bulkInsertUrl?: string;
  // bulkTemplateName?: string;
  // deleteAllVisible?: boolean;
  // showDeleteStatusWindow?: boolean;
  // getAllIds?: () => Promise<any>;
  // deleteId?: (id: string) => Promise<CommandResult<any>>;
  // onUploadBegin?: () => void;
  // onUploadEnd?: () => void;
  // hideUploadResult?: boolean;

  sticky?:
  | boolean
  | {
    offsetHeader?: number
    offsetSummary?: number
    offsetScroll?: number
    getContainer?: () => Window | HTMLElement
  }
  scroll?: { scrollToFirstRowOnChange: boolean; x: string | number | true; y: string | number }
  displayOptionalColumnsByDefault?: boolean
  childrenColumnName?: string
  expandable?: {
    expandedRowKeys?: readonly string[]
    defaultExpandedRowKeys?: readonly string[]
    expandedRowRender?: any
    expandRowByClick?: boolean
    expandIcon?: any
    onExpand?: (expanded: boolean, record: any) => void
    onExpandedRowsChange?: (expandedKeys: readonly string[]) => void
    defaultExpandAllRows?: boolean
    indentSize?: number
    expandIconColumnIndex?: number
    expandedRowClassName?: any
    childrenColumnName?: string
    rowExpandable?: (record: any) => boolean
    columnWidth?: number | string
    fixed?: any
  }

}

type RowMode = 'editor' | 'normal'

interface TableRow<T> {
  item: T
  mode: RowMode
  selected: boolean
}

const Table: React.FC<TableProps<any>> = <T,>({ t, size, ...props }: TableProps<T>) => {
  const { model, rowKey = 'id' as keyof T, childrenColumnName = 'children' } = props

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
  const buildRows = (next: ListState<T>, current: TableRow<T>[] = []): TableRow<T>[] => {
    if (next == null) return []
    const nextData = next?.items || []
    return nextData.map((o) => {
      const item = current.find((x) => x.item[rowKey] === o[rowKey])
      const newItem = JSON.parse(JSON.stringify(o)) as T
      return {
        item: newItem,
        mode: item?.mode ?? 'normal',
        selected: selectedRowKeys.any(t => t == newItem[rowKey] ),
      }
    })
  }

  const selectedSortProfileFromOrderBy = (nextOb: { field: string; direction: SortDirection }) => {
    const nextProfileSelected = {} as { field: string; direction: SortDirection }
    if ((model.sortFields || []).length !== 0 && nextOb != null) {
      const commonField = model.sortFields!.find((x) => nextOb.field === x.field)
      if (commonField != null) {
        nextProfileSelected.field = nextOb.field
        nextProfileSelected.direction = nextOb.direction
      }
    }

    return nextProfileSelected
  }

  const [data, setData] = useState<TableRow<T>[]>(buildRows(model?.data))
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [query, setQuery] = useState<Query>(model?.query ?? ({} as Query))
  const [sortProfileSelected, setSortProfileSelected] = useState<{ field: string; direction: SortDirection }>(
    selectedSortProfileFromOrderBy(model?.query?.orderBy?.[0] as any)
  )
  const timerRef = useRef<NodeJS.Timeout>()
  const [searchFilter, setSearchFilter] = useState<string>(model?.query?.parameters?.['$search'] as string)
  const [selectedOptionalColumns, setSelectedOptionalColumns] = useState<string[]>(
    props.displayOptionalColumnsByDefault === true ? (model?.columns || []).filter((x) => x.optional).map((x) => x.field) : []
  )
  const [optionalColumnsMenuVisible, setOptionalColumnsMenuVisible] = useState(false)
  

  useEffect(() => {
    setData(buildRows(model?.data))
    setQuery(model?.query || ({} as Query))
  }, [model]) // eslint-disable-line react-hooks/exhaustive-deps

  if (model == null) return null

  const isMobile = size.width < 480
  const isTablet = size.width >= 480 && size.width < 1024

  const pageSize = query && query.take ? query.take : props.pageSize ? props.pageSize : 50
  const totalPages = model && model.data ? Math.ceil((model.data == null ? 1 : model.data.count) / pageSize) : 1
  const totalItems = model && model.data ? model.data.count : 0

  let activePage = 1
  const skip = query?.skip as number
  const take = query?.take as number
  const count = model?.data?.count as number

  if (skip && take && count) {
    activePage = skip / take + 1
  }

  if (activePage > totalPages) activePage = Math.max(1, activePage - 1)

  const onTableChanged = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T>,
    extra: TableCurrentDataSource<T>
  ) => {
    if (extra.action === 'paginate') {
      setQuery((q) => {
        const { current = 1, pageSize = props.pageSize || 50 } = pagination
        let page = 1
        if (pageSize === q.take) page = current
        const nextQ = { ...q, skip: (page - 1) * pageSize, take: pageSize }
        if (props.onQueryChanged) props.onQueryChanged(nextQ as Query)
        return nextQ as Query
      })
    } else if (extra.action === 'sort') {
      const { field, order } = sorter
      if (field == null) return
      const nextOb = {
        field,
        direction: order === 'descend' ? 'Descending' : 'Ascending',
        useProfile: model.columns?.find((x) => x.sortField === field || x.field === field)?.useProfile ?? false,
      }

      setQuery((q) => {
        const nextQ = { ...q, orderBy: order == null ? [] : [nextOb] }
        if (props.onQueryChanged) props.onQueryChanged(nextQ as Query)
        return nextQ as Query
      })

      const nextProfileSelected = selectedSortProfileFromOrderBy((order != null ? nextOb : null) as any)
      setSortProfileSelected(nextProfileSelected)
    }
  }

  const onSaveRow = (form: FormInstance<any>, keyValue: T[keyof T]) => {
    form.validateFields().then((values: any) => {
      if (props.onSaveRow) {
        const row = data.find((x) => x.item[rowKey] === keyValue)
        const item = Object.assign({ ...row.item }, values)
        props.onSaveRow(item).then((result) => {
          if (result && result.isSuccess) {
            setData((curr) => {
              const row = curr.find((x) => x.item[rowKey] === keyValue)
              row.item = item
              row.mode = 'normal'
              return [...curr]
            })
          }
        })
      }
    })
  }

  const onRowEditCancelled = (form: FormInstance<any>, keyValue: T[keyof T]) => {
    form.resetFields()
    setData((curr) => {
      const row = curr.find((x) => x.item[rowKey] === keyValue)
      row.mode = 'normal'
      return [...curr]
    })
  }

  const onRowEdit = (keyValue: T[keyof T]) => {
    setData((curr) => {
      const row = curr.find((x) => x.item[rowKey] === keyValue)
      row.mode = 'editor'
      return [...curr]
    })
  }

  const isOnEditorMode = (keyValue: T[keyof T]) => {
    const row = data.find((x) => x.item[rowKey] === keyValue)
    return row?.mode === 'editor'
  }

  const onFilterChanged = (filterByQueryString: boolean, filterObject: any) => {
    const nextQ = clone<Query>(query)
    if (filterByQueryString) {
      nextQ.parameters = { ...nextQ.parameters, ...filterObject }
    } else {
      nextQ.filter = { ...nextQ.filter, ...filterObject }
    }

    if (props.onQueryChanged) props.onQueryChanged(nextQ as Query)
    setQuery(nextQ)
  }

  const onSortProfileChanged = (field: string, direction: SortDirection = 'Ascending') => {
    const empty = (field || '').length === 0
    const useProfile = !empty && (model.sortFields.find((x) => x.field === field)?.useProfile ?? false)
    setQuery((q) => {
      const nextQ = { ...q, orderBy: empty ? [] : [{ field, direction, useProfile }] }
      if (props.onQueryChanged) props.onQueryChanged(nextQ as Query)
      return nextQ as Query
    })
    setSortProfileSelected(empty ? null : { field, direction })
  }

  const onSearch = (value: string) => {
    if (timerRef?.current != null) clearTimeout(timerRef.current)
    setQuery((q) => {
      const nextQ = { ...q, skip: 0, parameters: { ...q.parameters, $search: value } }
      if (props.onQueryChanged) props.onQueryChanged(nextQ as Query)
      return nextQ as Query
    })
    setSearchFilter(value)
  }

  const onSearchValueChanged = (value: string) => {
    if (searchFilter !== value) {
      if (timerRef?.current != null) clearTimeout(timerRef.current)
      if ((value || '').length === 0) onSearch(value)
      else {
        timerRef.current = setTimeout(() => {
          onSearch(value)
        }, 1000)
      }
    }
    setSearchFilter(value)
  }

  let columns: Partial<ColumnType<T>>[] = []
  if (props.canEdit) {
    columns = [
      {
        title: '',
        fixed: props.editColumnFixed ?? false,
        width: 50,
        key: 'editColumnKey',
        dataIndex: 'operation',
        render: (_: any, record: T) => {
          const keyValue = record[rowKey]
          const editing = isOnEditorMode(keyValue)
          return (
            <div style={{ width: editing ? 50 : 'auto' }}>
              {editing ? (
                <span>
                  <EditableContext.Consumer>
                    {(form) => {
                      return (
                        <>
                          <a href="javascript:void(0);" onClick={() => onSaveRow(form, keyValue)} style={{ marginRight: 8 }}>
                            <SaveOutlined />
                          </a>
                          <Popconfirm
                            title={t('Are you sure that you want to discard these changes?')}
                            onConfirm={() => onRowEditCancelled(form, keyValue)}
                          >
                            <a>
                              <UndoOutlined />
                            </a>
                          </Popconfirm>
                        </>
                      )
                    }}
                  </EditableContext.Consumer>
                </span>
              ) : (
                <a onClick={() => onRowEdit(keyValue)}>
                  <EditOutlined />
                </a>
              )}
            </div>
          )
        },
      } as Partial<ColumnType<T>>,
    ]
  }

  columns = columns.concat(
    model.columns
      .filter((c) => c.visible !== false && (c.optional !== true || selectedOptionalColumns.includes(c.field)))
      .map((c) => {
        const sortField = query.orderBy ? query.orderBy.find((o) => o.field === (c.sortField || c.field)) : undefined
        const filterValue = c.filterByQueryString ? query.parameters?.[c.filterField || c.field] : query.filter?.[c.filterField || c.field]
        return {
          title: c.headerRenderer ? (
            c.headerRenderer()
          ) : (
            <>
              {c.searchable && <SearchOutlined style={{ color: '#1890ff' }} />}
              {t(c.title)}
            </>
          ),
          dataIndex: c.field || c.title,
          editorValuePropName: c.editorValuePropName,
          key: c.field || c.title,
          align: c.align || 'left',
          width: c.width,
          fixed: c.fixed,
          onCell: (record: any) => ({
            record,
            required: c.required,
            align: c.align,
            editorValuePropName: c.editorValuePropName,
            dataIndex: c.field || c.title,
            title: c.title,
            editor: c.editor,
            editing: isOnEditorMode(record[rowKey]),
          }),
          sorter: props.canSort !== false && !!c.sortable,
          sortOrder: !!c.sortable && c.sortable && sortField ? (sortField.direction === 'Ascending' ? 'ascend' : 'descend') : false,
          render: (text: string, record: any, index: number) =>
            c.renderer === undefined ? (
              <span style={{ textAlign: c.align || 'left' }}>{text}</span>
            ) : (
              <div style={{ textAlign: c.align || 'left' }}>{c.renderer(record)}</div>
            ),
          ...(!c.filter
            ? undefined
            : {
              filteredValue: filterValue,
              filterDropdown: (o: any) => (
                <FilterComponent
                  t={t}
                  i18n={props.i18n}
                  tReady={props.tReady}
                  onChange={(value) => {
                    const change = {} as any
                    change[c.filterField || c.field] = value
                    onFilterChanged(!!c.filterByQueryString, change)
                  }}
                  value={filterValue}
                >
                  {c.filter}
                </FilterComponent>
              ),
              filterIcon: () => (
                <FilterOutlined
                  style={{
                    color: !!filterValue ? '#1890ff' : undefined,
                  }}
                />
              ),
            }),
        } as Partial<ColumnType<T>>
      })
  )

  const onConfirmDeletion = () => {
    if (!props.onDeleteRow) return
    const modal = Modal.confirm({
      title: <h3>{`${t('Confirmation Required')}`}</h3>,
      icon: null,
      onOk: async () => {
        modal.destroy()
        setIsBusy(true)
        const total = data.length
        const result = await Promise.all(
          data
            .filter((x) => x.selected && x.item)
            .map((d: TableRow<T>) => {
              let item = d.item
              return props.onDeleteRow(item)
            })
        )
        const deleted = result.filter((x) => x?.isSuccess).length
        setData((x) => {
          x.forEach((d) => (d.selected = false))
          return [...x]
        })
        if (deleted === total) {
          setQuery((q) => {
            const take = q.take || pageSize
            const skip = Math.max(0, (q.skip || 0) - take)
            q.skip = skip
            props.onQueryChanged?.({ ...q } as Query)
            return { ...q } as Query
          })
        } else props.onQueryChanged?.({ ...query } as Query)
        setIsBusy(false)
      },
      content: <p>{t('Are you sure want to delete selected items?')}</p>,
      okText: t('Delete'),
      // okButtonProps: { style: { width: 120 } },
      cancelText: t('Cancel'),
      // cancelButtonProps: { type: 'default', style: { width: 120 } }
    })
  }

  const hasSelected = data.some((x) => x.selected)
  const optionalColumns = model.columns.filter((x) => x.optional)

  const leftToolbarLayout = props.leftToolbar ? props.leftToolbarSpan || 12 : props.leftToolbarSpan || 8
  const rightToolbarLayout = props.rightToolbarSpan || 24 - leftToolbarLayout
  return (
    <div className="table-v2-container">
      <Spin spinning={(model && model.data && model.data.isBusy) || isBusy}>
        <div
          className="table-header"
          style={{
            marginTop: props.embedded ? -65 : 0,
            marginBottom: props.embedded ? 16 : 0,
            marginRight: props.headerMarginRight ? props.headerMarginRight : 0,
            marginLeft: props.headerMarginLeft ? props.headerMarginLeft : 0,
          }}
        >
          <Row gutter={[16, 48]} align="middle">
            <Col span={leftToolbarLayout}>
              <ul className="toolbar" style={{ float: 'left' }}>
                {props.title && (
                  <li>
                    {typeof props.title === 'string' || props.title instanceof String ? <h3 style={{ margin: 0 }}>{props.title}</h3> : props.title}
                  </li>
                )}
                {props.canCreateNew && props.onNewItem && (
                  <li>
                    <Tooltip placement="topLeft" title={props.addNewLabel ? props.addNewLabel : t("Add new")}>
                      <Button icon={<PlusOutlined />} onClick={props.onNewItem}></Button>
                    </Tooltip>
                  </li>
                )}
                {hasSelected && props.canDelete && (
                  <li>
                    <Tooltip placement="topLeft" title={t('Delete selected')}>
                      <Button onClick={onConfirmDeletion} type="primary" danger>
                        <DeleteOutlined />
                      </Button>
                    </Tooltip>
                  </li>
                )}
              </ul>
              {props.leftToolbar && (
                <ul className="toolbar" style={{ marginLeft: 5, float: 'left' }}>
                  {props.leftToolbar}
                </ul>
              )}
            </Col>
            <Col span={rightToolbarLayout}>
              <ul className="toolbar" style={{ float: 'right' }}>
                {!isMobile && props.model.sortFields && props.model.sortFields.length > 0 && (props.canSort === undefined || props.canSort) && (
                  <li>
                    <Select
                      dropdownMatchSelectWidth={false}
                      allowClear
                      style={{ height: 36 }}
                      placeholder={t('Order by')}
                      value={sortProfileSelected?.field ?? undefined}
                      onChange={(value: any) => onSortProfileChanged(value as string)}
                    >
                      {(props.model.sortFields || []).map((o) => (
                        <Select.Option key={o.field} value={o.field}>
                          {o.text}
                        </Select.Option>
                      ))}
                    </Select>
                  </li>
                )}
                {!isMobile && sortProfileSelected?.field != null && props.canSort !== false && (
                  <li>
                    <Button
                      onClick={() =>
                        onSortProfileChanged(sortProfileSelected.field, sortProfileSelected.direction === 'Ascending' ? 'Descending' : 'Ascending')
                      }
                    >
                      {(sortProfileSelected.direction || 'Ascending') === 'Ascending' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    </Button>
                  </li>
                )}
                {!props.hideRefresh && (
                  <li>
                    <Button onClick={props.onRefresh}>
                      <ReloadOutlined />
                    </Button>
                  </li>
                )}
                {!isMobile && !props.hideFilter && (
                  <li>
                    <Input.Search
                      className="table-v2__search"
                      value={searchFilter}
                      allowClear
                      placeholder={props.searchText || t('Input search text...')}
                      onSearch={onSearch}
                      onChange={(e) => onSearchValueChanged(e?.target?.value)}
                      style={{ width: props.searchWidth || 200 }}
                    />
                  </li>
                )}
                {optionalColumns.length !== 0 && (
                  <li>
                    <Dropdown
                      visible={optionalColumnsMenuVisible}
                      onVisibleChange={setOptionalColumnsMenuVisible}
                      overlay={
                        <Menu
                          style={{ maxHeight: '25vh', overflowY: 'auto' }}
                          selectedKeys={selectedOptionalColumns}
                          onClick={(e) => {
                            setOptionalColumnsMenuVisible(true)
                            setSelectedOptionalColumns((curr) => {
                              if (curr.includes(e.key)) return curr.filter((x) => x !== e.key)
                              else return [...curr, e.key]
                            })
                          }}
                        >
                          {optionalColumns.map((c) => {
                            const selected = selectedOptionalColumns.includes(c.field)
                            return (
                              <Menu.Item key={c.field} icon={<CheckOutlined style={selected ? null : { visibility: 'hidden' }} />}>
                                {c.title}
                              </Menu.Item>
                            )
                          })}
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <Button className="optional-columns-dropdown" style={{ padding: '0 5px !important' }}>
                        {t('Optional Columns')} ({selectedOptionalColumns.length}/{optionalColumns.length}) <DownOutlined />
                      </Button>
                    </Dropdown>
                  </li>
                )}
              </ul>
              {props.rightToolbar && (
                <ul className="toolbar" style={{ float: 'right', marginRight: 5 }}>
                  {props.rightToolbar}
                </ul>
              )}
            </Col>
          </Row>
          {props.tableHeader && (
            <Row gutter={[16, 16]} className="table-header-row" style={{ marginTop: 10 }}>
              <Col span={24}>{props.tableHeader}</Col>
            </Row>
          )}
          <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
            <Col span={24}>
              {(errorMessage || '').length !== 0 && (
                <Alert
                  type="error"
                  style={{ marginBottom: 16 }}
                  message={t('An error ocurred')}
                  description={errorMessage}
                  closable
                  onClose={() => setErrorMessage('')}
                />
              )}
              {(props.error || '').length !== 0 && (
                <Alert type="error" style={{ marginBottom: 16 }} message={t('An error ocurred')} description={props.error} />
              )}
            </Col>
          </Row>
          <Row gutter={[48, 48]} style={{ marginTop: 10 }}>
            <Col span={24}>
              {!props.hideContent && (
                <AntTable
                  components={{
                    body: {
                      row: EditableFormRow,
                      cell: EditableCell,
                    },
                  }}
                  locale={{
                    emptyText: t('No data'),
                    filterReset: t('Reset filter'),
                    selectAll: t('Select all'),
                    filterConfirm: t('Filter confirm'),
                    filterTitle: t('Filter'),
                    selectInvert: t('Invert selection'),
                    sortTitle: t('Sort'),
                  }}
                  childrenColumnName={childrenColumnName}
                  dataSource={data.map((x) => {
                    const item = x.item as any
                    if (item[childrenColumnName] != null && Array.isArray(item[childrenColumnName]) && item[childrenColumnName].length === 0)
                      item[childrenColumnName] = undefined
                    return item
                  })}
                  size={props.small ? 'small' : undefined}
                  columns={columns as any}
                  rowKey={rowKey as string}
                  onRow={
                    props.onRow == null && props.onRowClick == null
                      ? undefined
                      : (record, index) => {
                        let value = {} as React.HTMLAttributes<HTMLElement>
                        if (props.onRow != null) value = props.onRow(record as any, index)
                        if (props.onRowClick != null) {
                          const cb = value.onClick
                          value.onClick = (e) => {
                            cb?.(e)
                            props.onRowClick(record as any)
                          }
                        }
                        return value
                      }
                  }
                  pagination={
                    !!props.hidePagination
                      ? false
                      : {
                        position: [props.showPaginationOnTop ? 'topRight' : 'bottomRight'],
                        size: isMobile || isTablet ? 'small' : undefined,
                        showSizeChanger: !isMobile,
                        showQuickJumper: !isMobile,
                        current: activePage,
                        total: totalItems,
                        pageSizeOptions: props.pageSizeOptions || ['2', '4', '10', '25', '50'],
                        pageSize: pageSize,
                        showTotal: (total: number, range: any) => (isMobile ? '' : `${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total}`),
                      }
                  }
                  onChange={onTableChanged as any}
                  rowSelection={
                    !props.canSelect
                      ? undefined
                      : ({
                        onChange: (currentSelectedRowKeys: any[]) => {
                          setData((curr) => {
                            curr.forEach((x) => {
                              x.selected = currentSelectedRowKeys.includes(x.item[rowKey])
                              if (props.canSelectRow) x.selected = x.selected && props.canSelectRow(x.item)
                            });
                            var currentSelection = curr.filter(x => x.selected).map(x => x.item[rowKey])
                            setSelectedRowKeys(currentSelection);
                            if (props.onSelectedChange)
                              props.onSelectedChange(currentSelection);
                            return [...curr]
                          })
                        
                        },
                        getCheckboxProps:
                          !props.canSelectRow  
                            ? undefined
                            : (record: T) => {
                              if (props.canSelectRow(record)) return null
                              return {
                                disabled: true,
                                style: { visibility: 'hidden', display: 'none' },
                              } as Partial<CheckboxProps>
                            },
                      } as Partial<TableRowSelection<T>> as any)
                  }
                  rowClassName={props.rowClassName as any}
                  scroll={props.scroll}
                  sticky={props.sticky}
                  expandable={props.expandable as any}
                />
              )}
            </Col>
          </Row>
        </div>
      </Spin>
    </div>
  )
}

export const TableView = withTranslation()(withSize()(Table))
export default TableView
