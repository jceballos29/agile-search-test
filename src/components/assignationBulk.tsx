import * as React from 'react'
import autobind from 'autobind-decorator'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Spin, Row, Upload, Col, Tooltip, Dropdown, Menu, Modal, Alert, Button } from 'antd'
import HttpService from '../core/services/http.service'
//import { resolve } from 'src/inversify.config'
import FileSaver from 'file-saver'
import { EditOutlined } from '@ant-design/icons'

interface AssignationBulkProps extends WithTranslation {
  uploadComplete: () => void
  beginUpload: () => void
  urlBulkInsert: string
  downloadExcelTemplate: string,
  bulkTemplateName: string,
  onUploadEnd?: () => void
  downloadTemplateEnd?: () => void
  downloadTemplateBegin?: () => void
  notificationOnly?: boolean
  onMessageUploadClosed?: (result: ImportResult | undefined) => void
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

interface AssignationBulkState {

  uploading: boolean
  uploadingError?: any
  uploadComplete: boolean
  importResult?: ImportResult,
  downloadModal: boolean

}



class AssignationBulkComponent extends React.Component<AssignationBulkProps, AssignationBulkState> {


  constructor(props: AssignationBulkProps) {
    super(props)
    this.state = {
      uploading: false,
      uploadingError: "",
      uploadComplete: false,
      downloadModal: false
    }
  }

  //@resolve(HttpService)
  httpService!: HttpService

  componentDidUpdate(prevProps: AssignationBulkProps, prevState: AssignationBulkState, snapshot: any) {

  }


  downloadExcelTemplate = async () => {
    if (this.props.downloadExcelTemplate) {
        if (this.props.downloadTemplateBegin) {
            this.props.downloadTemplateBegin()
        }
      const result = await this.httpService.get(this.props.downloadExcelTemplate, {
        responseType: 'arraybuffer'
      })
      if (!this.props.notificationOnly) {
        const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
        (FileSaver as any).saveAs(blob, this.props.bulkTemplateName || "template.xlsx")
      }
      if (this.props.downloadTemplateEnd) this.props.downloadTemplateEnd()
    }
  }
  handleMenuClick = () => {
    this.downloadExcelTemplate()
  }

  //handleMenuClick = (e: any) => {
  //    switch (e.key) {
  //        case 'download':
  //            e.domEvent.stopPropagation();
  //            this.downloadExcelTemplate();
  //            break;
  //    }
  //}


  downloadTxtFile = () => {
    if (this.state.importResult && this.state.importResult.errors.length > 0) {
      const element = document.createElement("a")
      const file = new Blob(this.state.importResult.errors.map(o => o.reason + "\n") as any, { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = "errors.txt"
      document.body.appendChild(element) // Required for this to work in FireFox
      element.click()
    }
  }
  downloadTxtFileWarnings = () => {
    if (this.state.importResult && this.state.importResult.warnings.length > 0) {
      const element = document.createElement("a")
      const file = new Blob(this.state.importResult.warnings.map(o => o.reason + "\n") as any, { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = "warnings.txt"
      document.body.appendChild(element) // Required for this to work in FireFox
      element.click()
    }
  }
  private uploadComplete(response: ImportResult) {
    if (!this.props.notificationOnly)
    this.setState({ importResult: response, uploadComplete: true })
  }

  public render() {
    const { t } = this.props as any
    return (
      <>
        {this.props.urlBulkInsert &&
          <Tooltip title={t('Bulk upload items')}>
            <Button style={{ width: '36px', height: '36px', padding: 0 }} onClick={() => this.setState({ downloadModal: true })}>
              <EditOutlined style={{ marginRight: "5px" }} />
            </Button>
          </Tooltip>
        }

        {
          this.state.downloadModal &&
          <Spin spinning={this.state.uploading}>
            <Modal
              title={t('Bulk upload')}
              visible={this.state.downloadModal}
              okButtonProps={{ style: { display: 'none' } }}
              closable={false}
              onCancel={() => { this.setState({ downloadModal: false }) }}
            >
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
                  {/*<Icon type="download" />*/}download
                {t('Download import template')}
              </ Button>

              <h5 style={{ marginTop: '15px' }}>{t('We help you import your information in an agile way')}</h5>
              {this.props.urlBulkInsert && <li><Upload.Dragger
                name="file"
                headers={{
                  authorization: `Bearer ${HttpService.accessToken}`,
                  language: `${HttpService.language}`
                }}
                showUploadList={false}
                action={this.props.urlBulkInsert}
                onChange={info => {
                  if (info.file.status == 'uploading') {
                    this.setState({ uploading: true })
                    if (this.props.beginUpload)
                      this.props.beginUpload()
                  }
                  else {
                    this.setState({ uploading: false, downloadModal: false })
                  }
                  if (info.file.status == 'error' || (info.file.response && info.file.response.messages && info.file.response.messages.length > 0)) {
                    if (!info.file.response.error)
                      this.setState({ uploadingError: info.file.response, downloadModal: false })
                    else
                      this.setState({ uploadingError: info.file.response.error ? info.file.response.error.message : info.file.response.messages.map((i: any) => i.body).join(","), downloadModal: false })
                  } else {
                    this.setState({ uploadingError: undefined })
                  }
                  if (info.file.status == 'done') {
                    this.uploadComplete(info.file.response)
                    if (this.props.uploadComplete)
                      this.props.uploadComplete()
                    if (this.props.onUploadEnd)
                      this.props.onUploadEnd()
                    //if (this.props.onRefresh)
                    //    this.props.onRefresh();
                  }
                }}>
                <p className="ant-upload-text">{t('Click or drag file to this area to upload')}</p>
                <p className="ant-upload-drag-icon"> ------------
                  {/*this.state.uploading ? < Icon type="loading" /> : < Icon type="inbox" />*/}
                </p>

              </Upload.Dragger></li>}
            </Modal>
          </Spin>
        }
        <Modal
          visible={this.state.uploadComplete}
          closable={true}
          onOk={() => {
            this.setState({ uploadComplete: false, downloadModal: false })
            if (this.props.onMessageUploadClosed) { this.props.onMessageUploadClosed(this.state.importResult) }
          }}
          onCancel={() => {
            this.setState({ uploadComplete: false, downloadModal: false })
            if (this.props.onMessageUploadClosed) { this.props.onMessageUploadClosed(this.state.importResult) }
          }}
          okText={t("Ok")}

          cancelButtonProps={{ hidden: true }}
          title={t('Upload completed')}>
          <div>
            {
              this.state.importResult && this.state.importResult.success && this.state.importResult.totalElements != undefined &&
              <>  <Alert message={<p>{t("Total elements")} : {this.state.importResult.totalElements}</p>} banner type="info"
                showIcon />
                <Alert message={<p>{t("Total imported")} : {this.state.importResult.importedElements}</p>} banner type="info"
                  showIcon />
              </>
            }
            {
              this.state.importResult && this.state.importResult.errors && this.state.importResult.errors.length > 0 &&
              <>
                <Button onClick={this.downloadTxtFile}>{t("Download errors file")}</Button>
                <br></br>
                <Alert message={t("Errors")} description={this.state.importResult.errors.map(o => <> <p> {o.reason}</p> </>)} banner type="error" />

              </>
            }
            {
              this.state.importResult && this.state.importResult.warnings && this.state.importResult.warnings.length > 0 &&
              <>
                <Button onClick={this.downloadTxtFileWarnings}>{t("Download warnings file")}</Button>
                <br></br>
                <Alert message={t("Warnings")} description={this.state.importResult.warnings.map(o => <> <p> {o.reason}</p> </>)} banner type="warning" />
              </>
            }
          </div>

        </Modal>

      </>
    )
  }
}

export default withTranslation()(AssignationBulkComponent)