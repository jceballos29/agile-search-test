import * as React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { List as AntdList, Button, Spin, Input, Row, Col, Select, Tooltip, Modal, Alert, Popconfirm, Upload, Form, Dropdown, Menu } from 'antd'
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SaveOutlined, UndoOutlined, UploadOutlined } from '@ant-design/icons'
import { clone } from 'src/core/utils/object'
import autobind from 'autobind-decorator'
import { ListGridType } from 'antd/lib/list'
import CardCollapsable, { ColDefinition } from 'src/core/ui/card-collapsable'
import HttpService from "src/core/services/http.service"
import FileSaver from 'file-saver'
import { container } from 'src/inversify.config'
import { FormInstance } from 'antd/lib/form'
import { QueryResult, Query } from '../../stores/data-store'

let Search = Input.Search
let FormItem = Form.Item
let AntdListItem = AntdList.Item as any

export interface ItemRenderer<T> {
  body: FieldRenderer<T>
  actions: (t: T) => React.ReactNode[]
}

interface FieldRenderer<T> {
  key: keyof T
  display: (value: T) => React.ReactNode | string
  editor?: (value: T) => React.ReactNode | string
  rules?: any[]
}

export interface ListModel<T> {
  query: Query
  data: QueryResult<T>
  canDelete?: (item: T) => boolean
  canEdit?: (item: T) => boolean
  renderer: ItemRenderer<T>
  count: number
}

export interface IListViewProps<T> extends WithTranslation {
  model: ListModel<T>
  title?: string
  col?: ColDefinition
  canNew?: boolean
  rowKey: string

  embedded?: boolean
  headerMarginRight?: number
  headerMarginLeft?: number

  onEdit?: (t: T) => void
  onDelete?: (t: T) => void
  onNewItem?: () => void
  isBusy?: boolean

  grid?: ListGridType
  size?: 'small' | 'default' | 'large'
  itemLayout?: any
  onQueryChanged: (query: Query) => void
  onRefresh: () => void
  searchText?: string
  flat?: boolean
  selectable?: boolean
  onSelect?: (item: T) => void
  noSearch?: boolean

  bulkTemplateUrl?: string
  bulkInsertUrl?: string
  bulkTemplateName?: string
}


export interface IListViewState<T> {
  selectedItem?: T

  uploading: boolean
  uploadingError?: any
}

export interface ListItemProps<T> extends WithTranslation, IListViewProps<T> {
  item: T
  selected: boolean
}

export interface ListItemState<T> {
  mode: 'display' | 'edit'
  showDeletion: boolean

}

export class ListItem<T> extends React.Component<ListItemProps<T>, ListItemState<T>> {
  private form = React.createRef<FormInstance>();

  constructor(props: ListItemProps<T>) {
    super(props)
    this.state = {
      mode: 'display',
      showDeletion: false,
    }
  }

  onDeleteSelected = () => {

    if (this.props.onDelete)
      this.props.onDelete(this.props.item)
  }

  toggleEditing = () => {
    this.setState({ mode: this.state.mode == 'display' ? 'edit' : 'display' })
  }


  getActions = (item: T) => {
    const result = []
    const model = this.props.model
    const { t } = this.props

    if (model.canEdit && model.canEdit(item) && this.state.mode == 'display')
      result.push(<Tooltip title={t('Edit')}><EditOutlined onClick={this.toggleEditing} /></Tooltip>)

    if (model.canDelete && model.canDelete(item))
      result.push((
        <Popconfirm placement="leftTop" title={t("Are you sure want to delete this item?")} onConfirm={this.onDeleteSelected} okText={this.props.t("Yes")} cancelText={this.props.t("No")}>

          <Tooltip title={t('Delete')}>
            <DeleteOutlined />
          </Tooltip>
        </Popconfirm>))

    if (this.state.mode == 'edit') {
      result.push(<Tooltip title={t('Save')}><SaveOutlined onClick={this.onSaveItem} /></Tooltip>)
      result.push((<Popconfirm placement="leftTop" title={t("Are you sure that you want to discard these changes?")} onConfirm={this.toggleEditing} okText={this.props.t("Yes")} cancelText={this.props.t("No")} >

        <Tooltip title={t('Undo')}>
          <UndoOutlined />
        </Tooltip>
      </Popconfirm>))
    }



    return result
  }

  renderField = (field: string) => {

    const model = this.props.model.renderer as any
    const item = this.props.item

    if (this.state.mode == 'display' && model[field])
      return model[field].display(item)
    if (this.state.mode == 'edit' && model[field]) {

      const key: string = model[field].key
      const rules = model[field].rules || []

      if (model[field].editor)
        return (
          <FormItem name={key} rules={rules} initialValue={(item as any)[key]}>
            {model[field].editor(item)}
          </FormItem>
        )
    }

    return null
  }

  @autobind
  private onSaveItem() {
    this.form.current!.validateFields()
    var values = this.form.current!.getFieldsValue()

    if (this.props.onEdit) {
      const edit = Object.assign({}, this.props.item, values)
      this.props.onEdit(edit)
    }

    this.toggleEditing()
    this.props.onRefresh()
  }

  select = (t: T) => {
    if (this.props.onSelect)
      this.props.onSelect(t)
  }

  render() {

    const item = this.props.item
    const { t, model } = this.props

    return (
      <div
        key={(item as any)[this.props.rowKey]}
        onClick={() => this.select(item)}>

        <AntdListItem className={this.props.selectable ? ('selectable ' + (this.props.selected ? ' selected' : '')) : ''} actions={[...this.getActions(item), ...model.renderer.actions(item)]}>
          <Form ref={this.form}>
            {this.renderField('body')}
          </Form>
        </AntdListItem>
      </div>
    )
  }
}

const ListItemWrapper = withTranslation()(ListItem)

export class List<T> extends React.Component<IListViewProps<T>, IListViewState<T>>{
  private httpService: HttpService

  constructor(props: any) {
    super(props)
    this.state = {
      uploading: false
    }
    this.httpService = container.get(HttpService)
  }


  downloadExcelTemplate = async () => {
    if (this.props.bulkTemplateUrl) {
      const result = await this.httpService.get(this.props.bulkTemplateUrl, {
        responseType: 'arraybuffer'
      })
      const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
      (FileSaver as any).saveAs(blob, this.props.bulkTemplateName || "template.xlsx")
    }
  }

  handleMenuClick = (e: any) => {
    switch (e.key) {
      case 'download':
        e.domEvent.stopPropagation()
        this.downloadExcelTemplate()
        break
    }
  }


  @autobind
  private onSearchFilterChanged(value: string) {
    var query = clone<Query>(this.props.model.query)
    if (!query.parameters)
      query.parameters = {} as any;

    (query.parameters as any)['$search'] = value

    if (this.props.onQueryChanged)
      this.props.onQueryChanged(query)
  }

  onSelect = (t: T) => {
    this.setState({ selectedItem: t })

    if (this.props.onSelect)
      this.props.onSelect(t)
  }

  renderContent = () => {
    const { t, title, model } = this.props
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {this.props.bulkTemplateUrl && <Menu.Item key="download"><DownloadOutlined />{t('Download template')}</Menu.Item>}
      </Menu>
    )
    const inner = ([<div className="table-header" style={{ marginTop: this.props.embedded ? -64 : 0, marginBottom: this.props.embedded ? 16 : 0, marginRight: this.props.headerMarginRight ? this.props.headerMarginRight : 0, marginLeft: this.props.headerMarginLeft ? this.props.headerMarginLeft : 0 }}>
      <Row>
        <Col span={24}>
          {this.props.canNew && <ul className="toolbar" style={{ float: 'left' }}>
            <li><Tooltip placement="topLeft" title={t('Add new')}><Button icon={<PlusOutlined />} onClick={this.props.onNewItem}></Button></Tooltip></li>
            {this.props.bulkInsertUrl && <li><Upload
              name="file"
              headers={{
                authorization: `Bearer ${HttpService.accessToken}`,
              }}
              showUploadList={false}
              action={this.props.bulkInsertUrl}
              onChange={(info: any) => {
                if (info.file.status == 'uploading')
                  this.setState({ uploading: true })
                else {
                  this.setState({ uploading: false })
                }
                if (info.file.status == 'error' || (info.file.response.messages && info.file.response.messages.length > 0)) {

                  this.setState({ uploadingError: info.file.response.messages.map((i: any) => i.body).join(",") })
                } else {
                  this.setState({ uploadingError: undefined })
                }
                if (info.file.status == 'done')
                  if (this.props.onRefresh)
                    this.props.onRefresh()
              }}
            >
              <Tooltip title={t('Bulk upload items')}>
                <Dropdown.Button overlay={menu}>
                  <UploadOutlined />
                </Dropdown.Button>
              </Tooltip>
            </Upload></li>}
          </ul>}
          {!this.props.noSearch && <ul className="toolbar" style={{ float: 'right' }}>

            <li><Button onClick={this.props.onRefresh} icon={<ReloadOutlined />}></Button></li>
            <li>
              <Search
                placeholder={this.props.searchText || 'Input search text...'}
                onSearch={value => this.onSearchFilterChanged(value)}
                style={{ width: 200 }}
              />
            </li>
          </ul>}
        </Col>
      </Row>
    </div>,
    <Spin spinning={this.props.isBusy}>

      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        {this.state.uploadingError &&
          <Alert
            type='error'
            message={t('An error ocurred')}
            description={this.state.uploadingError} />
        }

      </div>
      <AntdList
        grid={this.props.grid}
        itemLayout={this.props.itemLayout}
        size={this.props.size}
        pagination={{
          onChange: (page, pageSize) => {
            const skipTo = (page - 1) * (pageSize || 10)
            this.props.onQueryChanged({ ...model.query, skip: skipTo })
          },
          pageSize: model.query.take,
          total: model.count
        }}
        dataSource={model.data.items as any[]}
        renderItem={container => {

          const item = container.item || container

          return <ListItemWrapper
            {...this.props as any}
            item={item}
            onSelect={this.onSelect as any}
            selected={this.state.selectedItem ? (this.state.selectedItem as any)[this.props.rowKey] == (item as any)[this.props.rowKey] : false}
            key={(item as any)[this.props.rowKey]}
          />
        }}
      />
    </Spin>])

    if (this.props.flat)
      return inner

    return <CardCollapsable title={this.props.title} col={this.props.col}>{inner}</CardCollapsable>
  }

  render() {

    const { t, title, model } = this.props

    return this.renderContent()

  }
}

export const ListView = withTranslation()(List)
