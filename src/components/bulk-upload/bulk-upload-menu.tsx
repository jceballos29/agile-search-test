import { DownloadOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import { FC, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { IdentityProps, withIdentity } from 'src/core/services/authentication'
import UploadModal from './upload-modal'

export interface BulkUploadOption {
  optionLabel: string
  modalName: string
  bulkInsertTemplateName: string
  bulkInsertTemplateUrl: string
  bulkInsertUrl: string
}

interface Props extends WithTranslation, IdentityProps {
  onBulkUploadComplete?: () => void
  onBulkUploadCancel?: () => void
  options: BulkUploadOption[]
  simple?: boolean
}

const BulkUploadMenu: FC<Props> = (props: Props) => {
  const [option, setOption] = useState<BulkUploadOption | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false)

  const { onBulkUploadComplete, onBulkUploadCancel, options, t } = props
  const handleSelectBulkInsertOption = (option: string | undefined) => {
    const selected = options.find((o) => o.optionLabel === option)
    if (selected) {
      setOption(selected)
      setUploadModalOpen(true)
      return
    }
    setOption(null)
  }

  const renderSelectionMenu = (
    <Menu onClick={(option: any) => handleSelectBulkInsertOption(option.key)}>
      {options.map((item: BulkUploadOption) => (
        <Menu.Item key={item.optionLabel}>{item.optionLabel}</Menu.Item>
      ))}
    </Menu>
  )

  return (
    <>
      {!props.simple && <Dropdown.Button type="primary" overlay={renderSelectionMenu}>{t('Bulk Upload Options')}</Dropdown.Button>}
      {props.simple &&
        <Button icon={<DownloadOutlined />} type="primary" onClick={() => { setOption(props.options.first()); setUploadModalOpen(true) }} style={{ marginRight: 20, minWidth: 200 }}>
          {props.options.first()?.optionLabel}
        </Button>}
      <UploadModal
        onBulkUploadComplete={onBulkUploadComplete}
        onBulkUploadCancel={onBulkUploadCancel}
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        modalName={option?.modalName}
        bulkInsertTemplateName={option?.bulkInsertTemplateName}
        bulkInsertTemplateUrl={option?.bulkInsertTemplateUrl}
        bulkInsertUrl={option?.bulkInsertUrl}
        hideUploadResult={true}
      />
    </>
  )
}

export default withIdentity(withTranslation()(BulkUploadMenu))
