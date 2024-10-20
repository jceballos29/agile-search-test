import * as React from 'react'
import HttpService from "src/core/services/http.service"
import { withTranslation, WithTranslation } from 'react-i18next'
import FileSaver from 'file-saver'
import { container } from 'src/inversify.config'
import { Row, Col, Button, Tooltip, Upload, Spin, Alert, Dropdown, Menu } from 'antd'
import  { DownloadOutlined, UploadOutlined } from '@ant-design/icons'

interface IBulkInsertComponentProps extends WithTranslation {
  bulkTemplateUrl?: string
  bulkInsertUrl?: string
  bulkTemplateName?: string
  onUpload?: () => void
  flat?: boolean
}

interface IBulkInsertComponentState {
  uploading: boolean
  error?: any
}

class BulkInsertComponent extends React.Component<IBulkInsertComponentProps, IBulkInsertComponentState>{
  httpService: HttpService = undefined as any;

  constructor(props: any) {
    super(props)

    this.state = {
      uploading: false
    }
    this.handleMenuClick = this.handleMenuClick.bind(this)
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

  private handleMenuClick(e: any) {
    switch (e.key) {
      case 'download':
        e.domEvent.stopPropagation()
        this.downloadExcelTemplate()
        break
    }
  }

  render() {
    const { t } = this.props as any

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {this.props.bulkTemplateUrl && <Menu.Item key="download"><DownloadOutlined />{t('Download template')}</Menu.Item>}
      </Menu>
    )

    return (<Spin spinning={this.state.uploading}>
      {this.state.error &&
        <Alert
          type='error'
          message={t('An error ocurred')}
          description={this.state.error} />
      }
      <ul className="toolbar" style={{ float: 'left' }}>
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
            if (info.file.status == 'error' && info.file.response.messages && info.file.response.messages.length > 0) {

              this.setState({ error: info.file.response.messages.map((i: any) => i.body).join(",") })
            } else {
              this.setState({ error: undefined })
            }
            if (info.file.status == 'done')
              if (this.props.onUpload)
                this.props.onUpload()
          }}
        >
          <Tooltip title={t('Bulk upload items')}>
            <Dropdown.Button overlay={menu}>
              <UploadOutlined />
            </Dropdown.Button>
          </Tooltip>
        </Upload></li>}
      </ul>
    </Spin>
    )
  }
}

export default withTranslation()(BulkInsertComponent)
