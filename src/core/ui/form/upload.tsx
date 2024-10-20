import * as React from 'react'
import { Button, Upload, Spin, Alert } from 'antd'
import HttpService, { formatMessage } from 'src/core/services/http.service'
import { withTranslation, WithTranslation } from 'react-i18next'
import { container } from 'src/inversify.config'
import { InboxOutlined } from '@ant-design/icons'
import { authenticationService } from 'src/core/services/authentication'

const Dragger = Upload.Dragger

interface FileChange {
  uid: string
  name: string
  status: any
  response: IFileUploadResult
  linkProps: any

}

interface FileChangeEvent {
  file: FileChange
  fileList: FileChange[]
  event: any
}

export interface FileSummary {
  fileName: string
  contentType: string
  fileLength: number
  url: string
  name: string
  id: string
  uid: string
}

export interface IFileUploadResult {
  isSuccess: boolean
  file: FileSummary
  messages: string[]
}

interface UploadProps extends WithTranslation {
  action?: string
  multiple?: number
  text?: string
  maxFilesCount?: number
  isBusy?: boolean
  onChange?: (item: FileSummary[]) => void
  value?: FileSummary[]
  onRef?: (e: UploadComponent) => void
}

interface UploadState {
  uploading: boolean
  error: any
  files: FileSummary[]
  fileList: any[]
}
export class UploadComponent extends React.Component<UploadProps, UploadState>{

  httpService!: HttpService

  constructor(props: any) {
    super(props)
    this.state = {
      uploading: false,
      error: undefined,
      files: [],
      fileList: this.props.value || []
    }
    this.httpService = container.get(HttpService)
  }


  reset = () => {
    this.setState({ fileList: [] })
  }

  parseError = (error: any) => {
    if (error.messages) {
      return error.messages.map((i: any) => i.body).join(";")
    }
    return 'Error'
  }

  onChange = (e: any) => {
    let fileList = this.props.maxFilesCount ? e.fileList.slice(this.props.maxFilesCount * -1) : e.fileList
    const filter = fileList
      .filter((t: any) => t.status == 'done')
      .map((i: any) => i.response.file)

    if (this.props.onChange)
      this.props.onChange(filter)

    this.setState({ files: filter, fileList: fileList })
  }

  render() {

    const { uploading } = this.state
    const { t } = this.props

    const multiple = this.props.multiple

    const canUpload = this.props.maxFilesCount ? this.state.files.length < this.props.maxFilesCount : true

    return (<Spin spinning={this.state.uploading || this.props.isBusy}>
      {this.state.error && <Alert
        type='error'

        message={t('An error ocurred')}
        description={this.state.error} />}
      {<Dragger
        disabled={!canUpload}
        fileList={this.state.fileList}
        headers={{
          Authorization: `Bearer ${authenticationService.accessToken}`
        }}
        onChange={this.onChange}
        action={this.props.action}
        multiple
        showUploadList={{ showDownloadIcon: false, showRemoveIcon: true }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{this.props.text || t('Click or drag file to this area to upload')}</p>

      </Dragger>}
    </Spin>)
  }
}

export default withTranslation()(UploadComponent)
