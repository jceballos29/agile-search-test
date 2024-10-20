import React from 'react'
import autobind from 'autobind-decorator'
import { Table as AntTable, Alert, Input, Row, Col, Button, Dropdown, Menu, Popconfirm, Modal, Select, Form, Card, Tooltip, Upload, Spin, Progress, notification } from 'antd'
import Icon, { SortAscendingOutlined, SortDescendingOutlined, FilterOutlined, SaveOutlined, UndoOutlined, EditOutlined, ReloadOutlined, CloudUploadOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons'
import { clone } from 'src/core/utils/object'
import 'src/core/utils/linq'
import { withTranslation, WithTranslation } from 'react-i18next'
import HttpService from "src/core/services/http.service"
import FileSaver from 'file-saver'
import { container } from 'src/inversify.config'
import { withSize } from 'react-sizeme'
import { Query, SortDirection, ListState } from '../../stores/data-store'
import { CommandResult } from '../../stores/types'
let Option = Select.Option
let Search = Input.Search

export interface TableSortFieldDefinition {
  field: string
  text: string
  useProfile: boolean
}

export interface ImportError {
  row: number
  reason: string
}

export interface ImportResult {
  success: boolean
  totalElements: number
  importedElements: number
  errors: ImportError[]
  warnings: ImportError[]
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
  filter?: TableColumnFilter | React.ReactNode
  fiterField?: string
  filterByQueryString?: boolean
  collapsing?: boolean
  selectableHeader?: boolean
  headerRenderer?: (title: string, onFilter?: (id: string, key: string, op: string, value: string, preventReload?: boolean) => void, onClearFilter?: (id: string, preventReload?: boolean) => void) => any
  renderer?: (item: T) => any
  editorValuePropName?: string,
  editor?: (item: T) => any
  width?: any,
  maxWidth?: any,
  fixed?: boolean | 'left' | 'right',
  children?: TableColumn<T>[]

}

export interface TableColumnFilter {
  children: React.ReactNode,
}

export interface TableModel<T> {
  query: Query,
  columns: TableColumn<T>[]
  data: ListState<T>
  sortFields?: TableSortFieldDefinition[]
}

export interface DeleteAllOption {

}

export type ItemState = 'Unchanged' | 'New' | 'Changed'

export interface TableProps<T> extends WithTranslation {
  error?: string
  title?: string | React.ReactNode
  rowKey: string
  embedded?: boolean
  headerMarginRight?: number
  headerMarginLeft?: number
  model: TableModel<T>
  onRefresh?: () => void
  canCreateNew?: boolean
  onNewItem?: () => void
  canEdit?: boolean
  canSort?: boolean
  onSaveRow?: (item: T, state: ItemState) => Promise<CommandResult<any>>
  canDelete?: boolean
  canSelect?: boolean
  deleteLabel?: string
  canSelectRow?: (item: T) => boolean
  onDeleteRow?: (item: T, state: ItemState) => Promise<CommandResult<any>>
  onRowClick?: (item: T, state: ItemState) => void
  searchText?: string
  onQueryChanged: (query: Query) => void
  searchWidth?: number
  bulkTemplateUrl?: string
  bulkInsertUrl?: string
  bulkTemplateName?: string
  rightToolbar?: React.ReactNode
  leftToolbar?: React.ReactNode
  tableHeader?: React.ReactNode
  hideContent?: boolean
  hideFilter?: boolean
  hidePagination?: boolean
  hideRefresh?: boolean
  hideSelection?: boolean
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>
  rowClassName?: (record: T, index: number) => string
  pageSize?: number
  deleteAllVisible?: boolean
  showDeleteStatusWindow?: boolean
  getAllIds?: () => Promise<any>
  deleteId?: (id: string) => Promise<CommandResult<any>>
  onUploadBegin?: () => void
  onUploadEnd?: () => void
  small?: boolean
  pageSizeOptions?: string[]
  initPagination?: boolean
  showPaginationOnTop?: boolean
  onSelectedChange?: (rowKeys: any[]) => void
  sticky?: boolean | any
  scroll?: { scrollToFirstRowOnChange: boolean; x: string | number | true; y: string | number }
  hideUploadResult?: boolean
  summary?: any
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
  //onPageChange?: (skip: number, take: number) => void;
  //onSearchFilterChanged?: (q: string) => void;
  //onFilterChanged?: (filterObject: any) => void;
  //onOrderByChanged?: (orderBy: string, orderDirection: SortDirection) => void;
  //editLabel?: string;
  //extraActions?: {content: any, onClick: (item: T) => void}[];
  //disallowHidingColumns?: boolean;
}

export interface TableState<T> {
  rowKey: string
  columns: TableColumn<T>[]
  searchFilter: string
  data: TableRow<T>[]
  result: CommandResult<any> | undefined
  showDeleteConfirm: boolean
  toDelete: TableRow<T> | undefined
  pageSize: number
  activePage: number
  totalPages: number
  totalItems: number
  filter: { [id: string]: { key: string, op: string, value: string } }
  selectedRowKeys: any[]
  showConfirmDeletion: boolean
  showConfirmAllDeletion: boolean
  editingKey: string
  filters: any
  parameters: any
  isBusy: boolean
  uploadingError?: any
  uploadComplete: boolean
  importResult?: ImportResult,
  loadingMessage: string,
  deleteElements: number
  deleteElementsDeleted: number
  onDeleting: boolean
  deleteFinished: boolean
  deleteElementsFail: number
  profileSorterState: {
    field: string
    direction: SortDirection
  }
  downloadModal: boolean
  onSetSearch?: boolean
}

type RowMode = 'editor' | 'normal'

interface TableRow<T> {
  item: T
  state: ItemState
  original: T
  mode: RowMode
  selected: boolean
  actionsMenuOpened: boolean
}

const FormItem = Form.Item
const EditableContext = React.createContext({})

const EditableRow = (props: any) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props as any} />
      </EditableContext.Provider>
    </Form>
  )
}
const EditableFormRow = EditableRow

class EditableCell extends React.Component<any> {
  render() {
    let {
      centered,
      required,
      editing,
      editor,
      dataIndex,
      title,
      inputType,
      record,
      index,
      editorValuePropName,
      ...restProps
    } = this.props
    return (
      <EditableContext.Consumer>
        {(form: any) => {
          return (
            <td {...restProps} className={editing ? `ant-table-cell-editing ${restProps.className}` : restProps.className} style={{ textAlign: centered ? 'center' : '', ...restProps.style }}>
              {editing && editor ? (
                <FormItem name={dataIndex}
                  initialValue={record[dataIndex]}
                  valuePropName={editorValuePropName || 'value'}
                  rules={[{
                    required: required || false,
                    message: `Field '${title}' is required!`,
                  }]}
                  style={{ margin: 0 }}>
                  {editor(record)}
                </FormItem>
              ) : restProps.children}
            </td>
          )
        }}
      </EditableContext.Consumer>
    )
  }
}

interface FilterComponentProps {
  value: any,
  onChange: (value: any) => void
}

class FilterComponent extends React.Component<FilterComponentProps> {
  constructor(props: FilterComponentProps) {
    super(props)
    this.state = {}
  }

  @autobind
  public onValueChanged(value: any) {
    this.props.onChange(value?.length === 0 ? undefined : value)
  }

  @autobind
  public onClearFilter() {
    this.props.onChange(undefined)
  }

  public render() {
    if (!this.props.children)
      return <Card>filter not configured</Card>

    return <Card style={{ minWidth: 320 }}>{React.cloneElement(this.props.children as any, { value: this.props.value, onChange: this.onValueChanged })}{this.props.value && <a style={{ float: 'right', marginTop: 10 }} onClick={this.onClearFilter}>Clear filter</a>}</Card>
  }
}

class Table<T> extends React.Component<TableProps<T> & WithTranslation, TableState<T>> {


  constructor(props: TableProps<T> & WithTranslation) {
    super(props)

    const profileSorterState = {} as any
    if ((props?.model?.sortFields || []).length !== 0 && (props?.model?.query?.orderBy || []).length !== 0) {
      const commonField = props.model.sortFields!.find((x) => props.model.query.orderBy!.some(y => y.field === x.field))
      if (commonField != null) {
        profileSorterState.field = commonField.field
        profileSorterState.direction = props!.model.query.orderBy!.find(y => y.field === commonField.field)?.direction
      }
    }
    var search = ''
    var parameters = (props?.model?.query?.parameters as any)
    if (parameters) {
      var searchcurrent = parameters['$search']
      if (searchcurrent) {
        search = searchcurrent
      }
    }
    var activePage = 1
    var skip = (props?.model?.query?.skip as any)
    var take = (props?.model?.query?.take as any)
    var count = (props?.model?.data?.count as any)

    if (skip && take && count) {
      activePage = (skip / take) + 1
    }
    this.state = {
      columns: props.model.columns,
      searchFilter: search,
      data: this.BuildRows(props.model.data),
      result: undefined,
      showDeleteConfirm: false,
      toDelete: undefined,
      activePage: activePage,
      pageSize: props.model && props.model.query && props.model.query.take ? props.model.query.take : (props.pageSize ? props.pageSize : 50),
      totalPages: props.model && props.model.data ? Math.ceil((props.model.data == null ? 1 : props.model.data.count) / 10) : 1,
      totalItems: props.model && props.model.data ? props.model.data.count : 0,
      filter: {},
      selectedRowKeys: [],
      showConfirmDeletion: false,
      editingKey: '',
      rowKey: props.rowKey || 'id',
      filters: {},
      parameters: {},
      isBusy: false,
      uploadComplete: false,
      loadingMessage: "",
      showConfirmAllDeletion: false,
      deleteElements: 0,
      deleteElementsDeleted: 0,
      onDeleting: false,
      deleteFinished: false,
      deleteElementsFail: 0,
      profileSorterState,
      downloadModal: false,
      onSetSearch: true
    }
  }


  UNSAFE_componentWillReceiveProps(nextProps: TableProps<T> & WithTranslation) {
    if (nextProps.initPagination !== this.props.initPagination) {
      this.setState({ activePage: 1 })
    }
    this.setState({
      columns: nextProps.model.columns,
      data: this.BuildRows(nextProps.model.data),
      result: undefined,
      totalItems: nextProps.model.data.count,
      totalPages: Math.ceil((nextProps.model.data == null ? 1 : nextProps.model.data.count) / this.state.pageSize),
    })
  }

  private BuildRows(result: ListState<T>): TableRow<T>[] {
    const originalData = this.state && this.state.data ? this.state.data : []
    const data = result == null ? [] : (result.items || [])
    return data.map((o) => {
      let existings = originalData.filter(x => (x.item as any)[this.state.rowKey] === (o as any)[this.state.rowKey])
      let state = existings.length > 0 ? existings[0].state : "Unchanged"
      let original = JSON.parse(JSON.stringify(o))
      let newItem = JSON.parse(JSON.stringify(o))
      return {
        state: state,
        item: newItem,
        original: existings.length > 0 ? existings[0].item : original,
        mode: state === 'New' ? 'editor' : 'normal',
        actionsMenuOpened: false,
        selected: false,
      } as TableRow<T>
    })
  }

  //@autobind
  //private openNewForm() {
  //    this.props.onNewItem();
  //}

  @autobind
  private async onDeleteRow() {
    const row = this.state.toDelete
    if (this.props.onDeleteRow && row) {
      this.hideConfirmModal()
      const result = await this.props.onDeleteRow(row.item, row.state)
      if (result && result.isSuccess) {
        //this.props.model.data.discard(row.item);
        this.setState({ data: this.state.data.filter((o) => o.item !== row.item) })
      }
    }
  }

  //top level orderby
  @autobind
  private onSortDirection() {
    const sorterState = this.state.profileSorterState

    if (!sorterState?.field) return

    let nextDirection: SortDirection = 'Ascending'
    if (sorterState.direction === 'Ascending') nextDirection = 'Descending'

    const query = clone<Query>(this.props.model.query)
    query.orderBy = [
      {
        field: sorterState.field,
        direction: nextDirection,
        useProfile: this.props.model.sortFields?.find((x) => x.field === sorterState.field)?.useProfile ?? false
      }
    ]

    this.setState({
      profileSorterState: {
        direction: nextDirection,
        field: sorterState.field
      }
    })

    if (this.props.onQueryChanged) this.props.onQueryChanged(query)
  }

  @autobind
  private hideConfirmModal() {
    this.setState({ showDeleteConfirm: false, toDelete: undefined })
  }

  //@autobind
  //private showConfirmModal(row: TableRow<T>) {
  //    row.actionsMenuOpened = false;
  //    this.forceUpdate();
  //    this.setState({showDeleteConfirm: true, toDelete: row});
  //}

  @autobind
  private handlePaginationChange(currentPage: number) {
    if (currentPage !== this.state.activePage) {
      this.setState({
        activePage: currentPage
      })

      const query = clone<Query>(this.props.model.query)

      query.skip = (currentPage - 1) * this.state.pageSize
      query.take = this.state.pageSize

      this.props.model.query = query

      if (this.props.onQueryChanged)
        this.props.onQueryChanged(query)
    }
  }

  @autobind
  private handlePageSizeChange(pageSize: number) {
    if (pageSize !== this.state.pageSize) {
      this.setState({
        pageSize: pageSize,
        activePage: 1
      })

      const query = clone<Query>(this.props.model.query)

      query.skip = 0
      query.take = pageSize

      this.props.model.query = query

      if (this.props.onQueryChanged)
        this.props.onQueryChanged(query)
    }
  }

  @autobind
  private onFilterChanged(filterByQueryString: boolean, filterObject: any) {
    const query = clone<Query>(this.props.model.query)
    if (filterByQueryString) {
      query.parameters = filterObject
    } else {
      query.filter = filterObject
    }

    if (this.props.onQueryChanged)
      this.props.onQueryChanged(query)
  }

  //top level orderby
  @autobind
  private onOrderByChanged(field: string) {
    const query = clone<Query>(this.props.model.query)

    if (!field) {
      query.orderBy = []
      this.setState({ profileSorterState: {} as any })
    } else {
      query.orderBy = [
        {
          field,
          direction: 'Ascending',
          useProfile: this.props.model.sortFields?.find((x) => x.field === field)?.useProfile ?? false
        }
      ]
      this.setState({
        profileSorterState: {
          field,
          direction: 'Ascending'
        }
      })
    }

    if (this.props.onQueryChanged) this.props.onQueryChanged(query)
  }

  @autobind
  private onSearchFilterChanged(value: string) {
    if (this.state.onSetSearch != true) return
    clearTimeout(this.timer)
    const query = clone<Query>(this.props.model.query)
    if (!query.parameters)
      query.parameters = {} as any;

    (query.parameters as any)['$search'] = value
    this.setState({
      activePage: 1
    })

    query.skip = 0
    query.take = this.state.pageSize

    this.props.model.query = query
    if (this.props.onQueryChanged)
      this.props.onQueryChanged(query)

  }

  //private getOnClick = (data: TableRow<T>) => {
  //    if (this.props.onRowClick == null || data.mode === 'editor' ) {
  //        return null;
  //    } else {
  //        return () => this.props.onRowClick(data.item, data.state);
  //    }
  //}

  //private addFilter = (id: string, key: string, op: string, value: string, preventReload?: boolean) => {
  //    const filter = this.state.filter;
  //    filter[id] = {key, op, value};
  //    this.setState({filter}, () => {
  //        if (!preventReload && this.props.onFilterChange) {
  //            this.setState({activePage: 1});
  //            const filters = getProperties(filter).map((kvp) => kvp.value);
  //            this.props.onFilterChange(filters);
  //        }
  //    });
  //}

  //private removeFilter = (id: string, preventReload?: boolean) => {
  //    const filter = this.state.filter;
  //    delete filter[id];

  //    this.setState({filter}, () => {
  //        if (!preventReload && this.props.onFilterChange) {
  //            this.setState({activePage: 1});
  //            const filters = getProperties(filter).map((kvp) => kvp.value);
  //            this.props.onFilterChange(filters);
  //        }
  //    });
  //}

  @autobind
  private onSelectChange(selectedRowKeys: any[]) {

    if (this.props.canSelectRow) {
      var selected = []
      for (let i = 0; i < selectedRowKeys.length; i++) {
        const key = selectedRowKeys[i]
        let item = this.props.model.data.items.filter((o: any) => o.id === key)[0]
        if (item) {
          if (!this.props.canSelectRow(item)) {
            selected.push(key)
          }
        }
      }
      if (selectedRowKeys.length === this.props.model.data.items.length && selected.length === this.state.selectedRowKeys.length) {
        selected = []
      }
      this.setState({ selectedRowKeys: selected })
      if (this.props.onSelectedChange) {
        this.props.onSelectedChange(selected)
      }
      return
    }
    this.setState({ selectedRowKeys })
    if (this.props.onSelectedChange) {
      this.props.onSelectedChange(selectedRowKeys)
    }
  }

  @autobind
  private async onDeleteItems() {
    if (this.props.showDeleteStatusWindow) {
      this.setState({ isBusy: true })
      this.setState({ showConfirmDeletion: false })
      if (this.props.onDeleteRow) {

        let deleteok = 0
        let deletefail = 0
        var totalElementCount = this.props.model.data.count
        var elementCount = this.props.model.data.items.length
        let selectedFail: any[] = []
        const items = []
        for (let i = 0; i < this.state.selectedRowKeys.length; i++) {
          const key = this.state.selectedRowKeys[i]
          let item = this.props.model.data.items.filter((o: any) => (o as any)[this.state.rowKey] === key)[0]
          if (item) {
            items.push(item)
          }
        }
        this.setState({ deleteElements: items.length, deleteElementsDeleted: 0, deleteElementsFail: 0, onDeleting: true, deleteFinished: false })
        for (let i = 0; i < items.length; i++) {

          let item = items[i]
          if (item) {
            let existings = this.state.data.filter(o => (o.item as any)[this.state.rowKey] === (item as any)[this.state.rowKey])
            let state = existings.length > 0 ? existings[0].state : "Unchanged"
            const deletion = await this.props.onDeleteRow(item, state).catch(_ => {
              deletefail++
              selectedFail.push((item as any)[this.state.rowKey])
            })
            if (deletion && deletion.isSuccess) {
              deleteok++
            } else {
              deletefail++
              selectedFail.push((item as any)[this.state.rowKey])
            }

            this.setState({ deleteElementsDeleted: deleteok, deleteElementsFail: deletefail })
          }
        }
        this.setState({
          deleteFinished: true, isBusy: false, selectedRowKeys: selectedFail as any[]
        })
        if (deletefail === 0) {
          this.setState({ onDeleting: false })
          const args = {
            message: this.props.t("Delete elements"),
            description:
              deleteok + " " + this.props.t("elements deleted successful"),
            duration: 5,
          }
          notification.open(args)
        }

        if (((this.props.model.query.skip + this.props.model.query.take) >= totalElementCount) && (elementCount === deleteok)) {
          var newQuery = { ...this.props.model.query }
          newQuery.skip = Math.max(0, newQuery.skip - newQuery.take)
          this.setState({ activePage: Math.max(1, this.state.activePage - 1) })
          this.props.onQueryChanged(newQuery)
        }
        else
          this.props.onQueryChanged(this.props.model.query)

      }

    } else {
      const self = this

      const elementCount = self.props.model.data.items.length
      let deletedElements = 0
      const totalElementCount = self.props.model.data.count

      self.setState({ showConfirmDeletion: false })
      await Promise.all(self.state.selectedRowKeys.map((key: any) => {

        deletedElements++

        let item = self.props.model.data.items.filter((o: any) => (o as any)[self.state.rowKey as string] === key)[0]
        if (item && self.props.onDeleteRow) {
          let existings = this.state.data.filter(o => (o as any)[this.state.rowKey] === (item as any)[this.state.rowKey])
          let state = existings.length > 0 ? existings[0].state : "Unchanged"
          return self.props.onDeleteRow(item, state) as any
        }
        return Promise.resolve() as any
      }))

      if (((self.props.model.query.skip + self.props.model.query.take) >= totalElementCount) && (elementCount === deletedElements)) {
        const newQuery = { ...self.props.model.query }
        newQuery.skip = Math.max(0, newQuery.skip - newQuery.take)
        this.props.onQueryChanged(newQuery)
        this.setState({ activePage: Math.max(1, this.state.activePage - 1) })
      }
      else
        this.props.onQueryChanged(self.props.model.query)

      self.setState({ selectedRowKeys: [], showConfirmDeletion: false })
    }
  }

  private isEditing(record: any) {
    return record.key === this.state.editingKey
  }

  downloadExcelTemplate = async () => {
    if (this.props.bulkTemplateUrl) {
      let httpService = container.get(HttpService)
      const result = await httpService.get(this.props.bulkTemplateUrl, {
        responseType: 'arraybuffer'
      })
      const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
      (FileSaver as any).saveAs(blob, this.props.bulkTemplateName || "template.xlsx")
    }
  }

  handleMenuClick = () => {
    this.downloadExcelTemplate()
  }

  @autobind
  private onSaveRow(form: any, key: any) {
    form.validateFields().then((values: any) => {
      if (this.props.onSaveRow) {
        const obj = this.state.data.filter(o => (o.item as any)[this.state.rowKey] === key)[0] as any
        values[this.state.rowKey] = (obj.item as any)[this.state.rowKey]
        this.props.onSaveRow(values, obj.state).then(result => {
          if (result && result.isSuccess) {
            obj.item = Object.assign(clone(obj.item), values)
            obj.state = 'Unchanged'
            obj.mode = 'normal'
            this.setState({ editingKey: '' })
          }
        })
      }
    })
  }

  @autobind
  private onRowEdit(key: string) {
    this.setState({ editingKey: key })
  }

  @autobind
  private onRowEditCancelled(form: any, _: string) {
    form.resetFields()
    this.setState({ editingKey: '' })
  }

  // column header level orderby
  @autobind
  private onChange(_: any, __: any, sorter: any) {
    const query = clone<Query>(this.props.model.query)

    let field = sorter.field
    if (!field) return

    query.orderBy = []
    if (sorter.order) {
      query.orderBy = [
        {
          field: field,
          direction: sorter.order === 'descend' ? 'Descending' : 'Ascending',
          useProfile: this.props.model.columns?.find((x) => x.field === field)?.useProfile ?? false
        }
      ]
    }

    const profileSorterState = {} as any

    if ((this.props.model.sortFields || []).length !== 0 && query.orderBy.length !== 0) {
      const commonField = this.props.model.sortFields!.find((x) => query.orderBy![0].field === x.field)
      if (commonField != null) {
        profileSorterState.field = commonField.field
        profileSorterState.direction = query.orderBy[0].direction
      }
    }

    this.setState({ profileSorterState })

    if (this.props.onQueryChanged) this.props.onQueryChanged(query)
  }

  //@autobind
  //private onDiscardRow(row: TableRow<T>) {
  //    if (row.state === 'New') {
  //        this.props.model.data.discard(row.item);
  //        this.setState({ data: this.state.data.filter((o) => o !== row) });
  //    } else {
  //        row.mode = 'normal';
  //        row.selected = false;
  //        row.item = clone(row.original);
  //        this.forceUpdate();
  //    }
  //}
  private uploadComplete(response: ImportResult) {

    this.setState({ importResult: response, uploadComplete: true })
  }

  private async OnClickDeleteAll() {
    this.setState({ isBusy: true })
    if (this.props.getAllIds && this.props.deleteId) {
      const allIds = await this.props.getAllIds()
      if ((allIds.data as any).success) {
        const ids = ((allIds.data as any).ids as string[])
        this.setState({ deleteElements: ids.length, deleteElementsDeleted: 0, deleteElementsFail: 0, showConfirmAllDeletion: false, onDeleting: true, deleteFinished: false })
        let deleteok = 0
        let deletefail = 0
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i]
          const deletion = await this.props.deleteId(id).catch(reason => {
            deletefail++
          })
          if (deletion && deletion.isSuccess) {
            deleteok++
          }
          this.setState({ deleteElementsDeleted: deleteok, deleteElementsFail: deletefail })
        }
        this.setState({
          deleteFinished: true, isBusy: false
        })
        if (deletefail === 0) {
          this.setState({ onDeleting: false })
          const args = {
            message: this.props.t("Delete elements"),
            description:
              deleteok + " " + this.props.t("elements deleted successful"),
            duration: 5,
          }
          notification.open(args)
        }

        var newQuery = { ...this.props.model.query }
        this.setState({ activePage: 1 })
        newQuery.skip = 0
        this.props.onQueryChanged(newQuery)
      }
    }

  }


  downloadErrorsTxtFile = () => {
    if (this.state.importResult && this.state.importResult.errors.length > 0) {
      const element = document.createElement("a")
      const file = new Blob(this.state.importResult.errors.map(o => o.reason + "\n") as any, { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = "errors.txt"
      document.body.appendChild(element) // Required for this to work in FireFox
      element.click()
    }
  }

  downloadWarningsTxtFile = () => {
    if (this.state.importResult && this.state.importResult.errors.length > 0) {
      const element = document.createElement("a")
      const file = new Blob(this.state.importResult.warnings.map(o => o.reason + "\n") as any, { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = "warnings.txt"
      document.body.appendChild(element) // Required for this to work in FireFox
      element.click()
    }
  }

  isString = (value) => {
    return typeof value === 'string' || value instanceof String
  }

  private timer: any
  @autobind
  private onChangeFilterChanged(value: string) {
    if (this.state.searchFilter !== value) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.onSearchFilterChanged(value)
      }, 600)
    }
    this.setState({ searchFilter: value })
  }

  @autobind
  private BuildColumn(c: TableColumn<T>) {
    var self = this
    var t = this.props.t;

    let sorField = this.props.model.query.orderBy ? this.props.model.query.orderBy.firstOrDefault(o => o.field === (c.sortField || c.field)) : undefined
    return {
      title: <>
        {c.searchable && <SearchOutlined style={{ color: '#1890ff', marginRight: 6 }} />}
        <span style={{ fontWeight: 700 }}>{this.isString(c.title) ? t(c.title) : c.title}</span>
      </>,
      dataIndex: c.field || c.title,
      editorValuePropName: c.editorValuePropName,
      key: c.field || c.title,
      align: c.align || 'left',
      width: c.width,
      maxWidth: c.maxWidth,
      fixed: c.fixed,
      children: c.children?.map(x=> this.BuildColumn(x)),
      onCell: (record: any) => ({
        record,
        required: c.required,
        align: c.align,
        editorValuePropName: c.editorValuePropName,
        dataIndex: c.field || c.title,
        title: c.title,
        editor: c.editor,
        editing: this.isEditing(record),
      }),
      sorter: c.sortable || false,
      sortOrder: c.sortable && sorField ? (sorField.direction === 'Ascending' ? 'ascend' : 'descend') : false,
      render: (text: string, record: any, index: number) => c.renderer === undefined ? <span style={{ textAlign: c.align || 'left' }}>{text}</span> : <div style={{ textAlign: c.align || 'left' }}>{c.renderer(record)}</div>,
      ...(!c.filter ? undefined : {
        filteredValue: self.state.filter[c.fiterField || c.field] || null,
        filterDropdown: (o: any) => (<FilterComponent onChange={value => {
          const change = {} as any
          change[c.fiterField || c.field] = value
          const filterObject = c.filterByQueryString ? { ...self.state.parameters, ...change } : { ...self.state.filter, ...change }
          self.setState({ filter: filterObject })
          self.onFilterChanged(c.filterByQueryString || false, filterObject)
          //confirm();
        }} value={self.state.filter[c.fiterField || c.field]}>{c.filter}</FilterComponent>),
        filterIcon: (filtered: any) => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      })
    }
  }

  public render() {
    const { t } = this.props as any
    let columns = []
    if (this.props.canEdit) {
      columns.push({
        title: "",
        width: 50,
        maxWidth: 50,
        dataIndex: 'operation',
        render: (text: string, record: any) => {
          const editable = this.isEditing(record)
          return (
            <div style={{ width: editable ? 50 : 'auto' }}>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => {
                      return (
                        <>
                          <a
                            href="javascript:;"
                            onClick={() => this.onSaveRow(form, record.key)}
                            style={{ marginRight: 8 }}>
                            <SaveOutlined />
                          </a>
                          <Popconfirm
                            title={this.props.t("Are you sure that you want to discard these changes?")}
                            onConfirm={() => this.onRowEditCancelled(form, record.key)}
                          >
                            <a><UndoOutlined /></a>
                          </Popconfirm>
                        </>)
                    }}
                  </EditableContext.Consumer>
                </span>
              ) : (
                <a onClick={() => this.onRowEdit(record.key)}><EditOutlined /></a>
              )}
            </div>
          )
        },
      } as any)
    }
    const self = this
    columns = columns.concat(this.state.columns.filter((c) => c.visible || c.visible === undefined).map(c => this.BuildColumn(c)))
    

    const width = (this.props as any).size.width
    const isMobile = width < 480
    const isTablet = width >= 480 && width < 1024

    const positions = ["bottomRight"]
    if (this.props.showPaginationOnTop) positions.push("topRight")

    let pagination = {
      position: positions,
      size: (isMobile || isTablet) ? 'small' : undefined,
      showSizeChanger: !isMobile,
      showQuickJumper: !isMobile,
      onShowSizeChange: (_: number, pageSize: number) => {
        this.handlePageSizeChange(pageSize)
      },
      onChange: (page: number) => {
        this.handlePaginationChange(page)
      },
      pageSizeOptions: this.props.pageSizeOptions || ['10', '25', '50'],
      pageSize: this.state.pageSize,
      total: this.state.totalItems,
      showTotal: (total: number, range: any) => isMobile ? '' : `${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total}`,
      current: this.state.activePage
    }

    let rowKey = 1
    const tableData = this.state.data.map(o => {
      const item = clone<T>(o.item);
      (item as any).key = (item as any)[this.state.rowKey] || rowKey
      rowKey++
      return item
    })

    const { selectedRowKeys } = this.state
    const rowSelection = (this.props.canEdit || this.props.canDelete || this.props.canSelect) ? {
      selectedRowKeys,
        onChange: this.onSelectChange,
        ...(this.props.canSelectRow ? {
            getCheckboxProps: (record: any) => ({
                disabled: this.props.canSelectRow(record),
            })
        } : {})
    } : null
    const hasSelected = this.state.data.some((x) => selectedRowKeys.some(t => t == x.item[this.state.rowKey]))
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    }

    let canEmbedd = this.props.embedded && (!this.state.result || this.state.result.isSuccess)
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {this.props.bulkTemplateUrl && <Menu.Item key="download"><DownloadOutlined />{t('Download template')}</Menu.Item>}
      </Menu>
    )

    // if (this.state.importResult != null && this.state.importResult.totalElements && this.state.importResult.importedElements) {
    //     const totalElements = this.props.t("Total Elements : ") + this.state.importResult.totalElements;
    //     const importedElements = t("Imported Elements : ") + this.state.importResult.importedElements;            
    // }
    return <div>

      <Modal
        visible={this.state.showConfirmAllDeletion}
        closable={false}
        onOk={() => this.OnClickDeleteAll()}
        onCancel={() => this.setState({ showConfirmAllDeletion: false })}
        okText={t("Ok")}
        cancelText={t("Cancel")}
        title={t('Confirmation required')}>
        <p>{t("Are you sure do you want to delete all items?")}</p>
      </Modal>

      <Modal
        visible={this.state.showConfirmDeletion}
        closable={false}
        onOk={this.onDeleteItems}
        onCancel={() => this.setState({ showConfirmDeletion: false })}
        okText={t("Ok")}
        cancelText={t("Cancel")}
        title={t('Confirmation required')}>
        <p>{t("Are you sure want to delete selected items?")}</p>
      </Modal>
      <Modal
        visible={this.state.uploadComplete}
        closable={true}
        onOk={() => this.setState({ uploadComplete: false, downloadModal: false })}
        onCancel={() => this.setState({ uploadComplete: false, downloadModal: false })}
        okText={t("Ok")}
        cancelButtonProps={{ hidden: true }}
        title={t('Upload complete')}>
        <div>

          {this.state.importResult && this.state.importResult.success && this.state.importResult.totalElements != undefined &&
            <>  <Alert message={<p>{t("Total elements")} : {this.state.importResult.totalElements}</p>} banner type="info"
              showIcon />
              <Alert message={<p>{t("Total imported")} : {this.state.importResult.importedElements}</p>} banner type="info"
                showIcon />
            </>
          }

          {this.state.importResult && this.state.importResult.errors && this.state.importResult.errors.length > 0 &&
            <>
              <Button onClick={this.downloadErrorsTxtFile}>{t("Download errors file")}</Button>
              <br></br>
              <Alert message={t("Errors")} description={this.state.importResult.errors.map(o => <> <p> {o.reason}</p> </>)} banner type="error" />

            </>
          }

          {this.state.importResult && this.state.importResult.warnings && this.state.importResult.warnings.length > 0 &&
            <>
              <Button onClick={this.downloadWarningsTxtFile}>{t("Download warnings file")}</Button>
              <br></br>
              <Alert message={t("Warnings")} description={this.state.importResult.warnings.map(o => <> <p> {o.reason}</p> </>)} banner type="warning" />

            </>
          }


        </div>

      </Modal>
      <Modal
        visible={this.state.onDeleting}
        closable={false}
        onOk={() => this.setState({ onDeleting: false })}
        onCancel={() => this.setState({ onDeleting: false })}
        okText={t("Ok")}
        cancelButtonProps={{ hidden: true }}
        okButtonProps={{ hidden: !this.state.deleteFinished && this.state.deleteElementsFail === 0 }}
        title={t('Delete elements')}>
        <Spin spinning={(this.props.model.data && this.props.model.data.isBusy) || this.state.isBusy} tip={t("Deleting...")}>
          <div>
            <div style={{ textAlign: "center" }}>
              <Progress type="circle" percent={this.state.deleteElements === 0 ? 0 : Math.round((this.state.deleteElementsDeleted + this.state.deleteElementsFail) * 100 / this.state.deleteElements)} />
            </div>
            <br></br>
            <>  <Alert message={<p>{t("Deleted elements")} : {this.state.deleteElementsDeleted}</p>} banner type="info"
              showIcon />
              {this.state.deleteElementsFail > 0 && <Alert message={<p>{t("Fail deletion")} : {this.state.deleteElementsFail}</p>} banner type="error"
                showIcon />}
            </>
          </div>
        </Spin>
      </Modal>
      <Spin spinning={(this.props.model.data && this.props.model.data.isBusy) || this.state.isBusy} tip={this.state.loadingMessage}>
        <div className="table-header" style={{ marginTop: canEmbedd ? -65 : 0, marginBottom: canEmbedd ? 16 : 0, marginRight: this.props.headerMarginRight ? this.props.headerMarginRight : 0, marginLeft: this.props.headerMarginLeft ? this.props.headerMarginLeft : 0 }}>

          <Row>
            <Col span={24}>
              <ul className="toolbar" style={{ float: 'left' }}>
                {this.props.title && <li>{((typeof this.props.title === 'string' || this.props.title instanceof String) ? <h3>{this.props.title}</h3> : this.props.title)}</li>}
                {this.props.canCreateNew && this.props.onNewItem && <li><Tooltip placement="topLeft" title={t('Add new')}><Button icon={<PlusOutlined />} onClick={this.props.onNewItem}></Button></Tooltip></li>}
                {hasSelected && this.props.canDelete && <li><Tooltip placement="topLeft" title={t('Delete selected')}><Button onClick={() => this.setState({ showConfirmDeletion: true })} type="primary" danger><DeleteOutlined /></Button></Tooltip></li>}

                {this.props.bulkInsertUrl && < Button onClick={() => this.setState({ downloadModal: true })}>{t('Bulk upload items')}</Button>}

                {this.state.downloadModal &&
                  <Modal
                    title={t('Bulk upload')}
                    visible={this.state.downloadModal}
                    okButtonProps={{ style: { display: 'none' } }}
                    closable={false}
                    onCancel={() => { this.setState({ downloadModal: false }) }}
                  >
                    <Spin spinning={this.state.isBusy}>
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ marginTop: '4px' }}>{t('Import template')}</h4>

                        <h5 style={{ marginTop: '4px' }}>{t('Use an excel template to easily import')}</h5>

                        <Button
                          block
                          color={'#40a9ff'}
                          onClick={() => {
                            this.handleMenuClick()
                            this.setState({ downloadModal: false })
                          }
                          }>
                          <DownloadOutlined />
                          {t('download import template')}
                        </ Button>
                      </div>

                      <h5>{t('We help you import your information in an agile way')}</h5>
                      {this.props.bulkInsertUrl && <li><Upload.Dragger
                        name="file"
                        headers={{
                          authorization: `Bearer ${HttpService.accessToken}`,
                          language: `${HttpService.language}`
                        }}
                        showUploadList={false}
                        action={this.props.bulkInsertUrl}
                        onChange={info => {
                          if (info.file.status == 'uploading') {
                            this.setState({ isBusy: true })
                            if (this.props.onUploadBegin)
                              this.props.onUploadBegin()
                          }
                          else {
                            this.setState({ isBusy: false, downloadModal: false })
                          }
                          if (info.file.status == 'error' || (info.file.response && info.file.response.messages && info.file.response.messages.length > 0)) {
                            if (!info.file.response.error)
                              this.setState({ uploadingError: info.file.response })
                            else
                              this.setState({ uploadingError: info.file.response.error ? info.file.response.error.message : info.file.response.messages.map((i: any) => i.body).join(",") })
                          } else {
                            this.setState({ uploadingError: undefined })
                          }
                          if (info.file.status == 'done') {
                            if (!this.props.hideUploadResult)
                              this.uploadComplete(info.file.response)
                            if (this.props.onUploadEnd)
                              this.props.onUploadEnd()
                            if (this.props.onRefresh && !this.props.hideUploadResult)
                              this.props.onRefresh()
                          }
                        }}>
                        <p className="ant-upload-text">{t('Click or drag file to this area to upload')}</p>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>

                      </Upload.Dragger></li>}
                    </Spin>
                  </Modal>
                }

                {this.props.deleteAllVisible && <li><Tooltip placement="topLeft" title={t('Delete All')}><Button onClick={() => this.setState({ showConfirmAllDeletion: true })} type='primary' danger><DeleteOutlined />{this.props.t("Delete All")}</Button></Tooltip></li>}
              </ul>
              {this.props.leftToolbar && <ul className="toolbar" style={{ marginLeft: 5, float: 'left' }}>
                {this.props.leftToolbar}
              </ul>}
              <ul className="toolbar" style={{ float: 'right' }}>
                {!isMobile && this.props.model.sortFields && this.props.model.sortFields.length > 0 && (this.props.canSort === undefined || this.props.canSort) && <li>
                  <Select dropdownMatchSelectWidth={false} allowClear style={{ height: 36 }} placeholder={t('Order by')} value={this.state.profileSorterState?.field ?? undefined} onChange={(value: any) => this.onOrderByChanged(value as string)}>
                    {(this.props.model.sortFields || []).map(o => <Option key={o.field} value={o.field}>{o.text}</Option>)}
                  </Select>
                </li>}
                {!isMobile && this.state.profileSorterState.field && (this.props.canSort === undefined || this.props.canSort) && <li>
                  <Button onClick={e => this.onSortDirection()}>
                    {(this.state.profileSorterState.direction || 'Ascending') === 'Ascending' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                  </Button>
                </li>}
                {!this.props.hideRefresh && < li > <Button onClick={this.props.onRefresh}><ReloadOutlined /></Button></li>}
                {!isMobile && !this.props.hideFilter && < li >
                  <Search
                    value={this.state.searchFilter}
                    allowClear
                    placeholder={this.props.searchText || t('Input search text...')}
                    onSearch={value => this.onSearchFilterChanged(value)}
                    onChange={e => this.onChangeFilterChanged(e.target.value)}
                    style={{ width: this.props.searchWidth || 200 }}
                  />
                </li>}
              </ul>
              {this.props.rightToolbar && <ul className="toolbar" style={{ float: 'right', marginRight: 5 }}>
                {this.props.rightToolbar}
              </ul>}
            </Col>
          </Row>
          {this.props.tableHeader && <Row className="table-header-row" style={{ marginTop: 10 }}><Col span={24}>{this.props.tableHeader}</Col></Row>}
        </div>
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          {this.state.uploadingError &&
            <Alert
              type='error'
              message={t('An error ocurred')}
              description={this.state.uploadingError} />
          }
          {this.state.result && !this.state.result.isSuccess &&
            <Alert type='error' style={{ marginBottom: 16 }}
              message={t('An error ocurred')}
              description={this.state.result.messages.map((o) => o.body)}
            />
          }
          {this.props.error &&
            <Alert type='error' style={{ marginBottom: 16 }}
              message={t('An error ocurred')}
              description={this.props.error}
            />
          }
        </div>
        {!this.props.hideContent && <AntTable
          onChange={this.onChange}
          components={components}
          rowSelection={this.props.hideSelection ? undefined : rowSelection as any}
          columns={columns}
          size={this.props.small ? "small" : undefined}
          onRow={this.props.onRow as any}
          rowClassName={this.props.rowClassName as any}
          locale={{
            emptyText: t('No data'),
            filterReset: t('Reset filter'),
            selectAll: t('Select all'),
            filterConfirm: t('Filter confirm'),
            filterTitle: t('Filter'),
            selectInvert: t("Invert selection"),
            sortTitle: t('Sort')
          }}
          scroll={this.props.scroll}
          sticky={this.props.sticky}
          pagination={this.props.hidePagination ? false : pagination as any}
          dataSource={tableData as any}
          expandable={this.props.expandable as any}
          summary={this.props.summary} />}
      </Spin>
    </div>
  }
}



export const TableView = withTranslation()(withSize()(Table)) as any
