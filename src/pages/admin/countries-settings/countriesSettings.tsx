import { withTranslation, WithTranslation } from 'react-i18next'
import React, { FC, useEffect, useState } from 'react'
import { container } from '../../../inversify.config'
import HttpService, { formatMessage } from '../../../core/services/http.service'
import { Alert, Button, Card, Col, Form, Input, message, Modal, Row, Spin, Upload } from 'antd'
import { ItemState, TableView } from '../../../core/ui/collections/table'
import { GetCountryFlag, GetFlag } from '../../../components/flags-icons'
import { Query } from '../../../core/stores/data-store'
import CountryCreate from './country-create'
import CountryEdit from './country-edit'
import { IdentityProps } from '../../../core/services/authentication'
import { CountryItem, CountryItemStore, CountryStore, CountrySummary } from '../../../stores/country-store'
import { UploadFile } from 'antd/lib/upload/interface'
import { clone, nameof } from '../../../core/utils/object'
import { UploadOutlined } from '@ant-design/icons'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import FileSaver from 'file-saver'
import userProfile, { UserProfileProps, withUserProfile } from '../../../components/user-profile'

interface CountriesSettingHomeProps extends WithTranslation, RouteComponentProps, UserProfileProps { }

const CountriesSetting: FC<CountriesSettingHomeProps> = (props) => {
  const { t } = props

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [pubParam, setPubParam] = useState(2)
  const [initPagination, setInitPagination] = useState(false)
  const [selectedRows, setSelectedRows] = useState<any[]>([])

  const [modalLoading, setModalLoading] = useState(false)

  const [query, setQuery] = useState({
      searchQuery: searchQuery,
      skip: 0,
      take: 10,
      orderBy: [{ field: 'name', direction: 'Ascending', useProfile: false }],
  } as Query)

  const httpService = container.get(HttpService)

  const [formC] = Form.useForm<CountryItem>()
  const [createCountryItem, setcreateCountryItem] = useState({} as CountryItem)
  const [visibleCreateCountry, setVisibleCreateCountry] = useState(false)
  const [errorCreateCountry, setErrorCreateCountry] = useState('')

  const countryStore = container.get(CountryStore)
  const countryState = countryStore.state

  const countryItemStore = container.get(CountryItemStore)
  const countryItemState = countryItemStore.state
  const [visibleCountry, setVisibleCountry] = useState(false)
  const [errorCountry, setErrorCountry] = useState('')

  const [editItem, setEditItem] = useState({} as CountryItem)

  const [visibleUpload, setVisibleUpload] = useState(false)
  const [uploadItem, setUploadItem] = useState({} as CountryItem)

  const [visibleDelete, setVisibleDelete] = useState(false)
  const [deleteItem, setDeleteItem] = useState({} as CountryItem)
  const [errorDeleteContact, setErrorDeleteContact] = useState('')
  const [messageApi, contextHolder] = message.useMessage()


  useEffect(() => {
    Load()
  }, [])

  let timer = null

  const Load = async (searchQuery: Query = query) => {
    setLoading(true)
    await countryStore.load(searchQuery)
    setLoading(false)
  }

  const showModal = async (countryItemId: string) => {
    setLoading(true)
    const item: CountryItem = await countryItemStore.load(countryItemId)

    formC.setFieldsValue({
      code: item.code,
      name: item.name,
      icon: item.icon,
      currency : item.currency
    })

    setEditItem(item)
    setVisibleCountry(true)
    setLoading(false)
  }

  const showModalCreateCountry = async () => {
    setLoading(true)
    setVisibleCreateCountry(true)
    setLoading(false)
    await formC.resetFields()
  }

    const handleSave = async () => {
    let item: CountryItem
    try {
      item = await formC.validateFields()
    } catch (e) {
      return
    }

    setModalLoading(true)
     
    var errorText = ''
    
    await httpService
      .put(`api/v1/countries/edit-country/${item.code}`, item)
      .then((result) => {
        props.userProfile.reload()
      }
      )
      .catch((error) => {
          setErrorCountry(t("There is already a Country with name") + (" ") + t(error))
        errorText = error
      })
      .finally(() => {
        setModalLoading(false)
        if (errorText == '') {
          setVisibleCountry(false)
          setErrorCountry('')
          formC.resetFields()
        }
        else setVisibleCountry(true)
      })

    Load()
  }

  const handleSaveCreatecountry = async () => {
    let item: CountryItem
    try {
      item = await formC.validateFields()
    } catch (e) {
      return
    }

    setModalLoading(true)

    var errorText = ''

    await httpService
      .post(`api/v1/countries/`, item)
      .then((result) => {
        props.userProfile.reload()
      }
      )
      .catch((error) => {
        setErrorCreateCountry(error)
        errorText = error
      })
      .finally(() => {
        setModalLoading(false)
        if (errorText == '') {
          setVisibleCreateCountry(false)
          setErrorCreateCountry('')
          formC.resetFields()
        }
        else setVisibleCreateCountry(true)

      }
      )

    Load()
  }

  const handleCancel = () => {
    setEditItem(null)
    setVisibleCountry(false)
    setErrorCountry('')
    formC.resetFields()
  }

  const handleCancelCreateCountry = () => {
    setcreateCountryItem(null)
    setVisibleCreateCountry(false)
    setErrorCreateCountry('')
    formC.resetFields()
  }

  const downloadTemplate = async () => {

    const result = await httpService.get(`api/v1/countries/template/`, {
      responseType: 'arraybuffer'
    })
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, "location-template.xlsx")
  }

  const downloadContactsTemplate = async () => {

    const result = await httpService.get(`api/v1/countries/template/contacts/`, {
      responseType: 'arraybuffer'
    })
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, "contacts-template.xlsx")
  }

  const leftToolBar = () => (
    <>
      <li>
        <Button type="primary" onClick={showModalCreateCountry}>
          {t("Create Country")}
        </Button>
      </li>

      {/*<Button type="primary" onClick={downloadTemplate} style={{ marginLeft: '10px' }}>
                    {t("Download Template for Locations")}
                </Button>*/}

    {
        //<li>
        //    <Button type="primary" onClick={downloadContactsTemplate} style={{ marginLeft: '10px' }}>
        //        {t("Download Template for Contacts")}
        //    </Button>
        //</li>
    }
    </>
  )

  const Header = (code: string) => {
    return (
      <Upload
        name='file'
        headers={{
          authorization: `Bearer ${HttpService.accessToken}`,
          language: `${HttpService.language}`
        }}
        //showUploadList={false}
        action={`${countryStore.baseUrl}/upload/code=${code}`}
        onChange={(info) => {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList)
          }
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`)
            setQuery(clone<Query>(query))
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`)
            //message.error(`Error:  ${info.file.error}`);
            //message.error(`Response:  ${info.file.response}`);
          }
        }}
      >
        <Button icon={<UploadOutlined />}> {t("Add Locations")}</Button>
      </Upload>
    )
  }

  const HeaderC = (code: string) => {
    return (
      <Upload
        name='file'
        headers={{
          authorization: `Bearer ${HttpService.accessToken}`,
          language: `${HttpService.language}`
        }}
        //showUploadList={false}
        action={`${countryStore.baseUrl}/contacts/code=${code}`}
        onChange={(info) => {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList)
          }
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`)
            setQuery(clone<Query>(query))
          } else if (info.file.status === 'error') {
            //message.error(`${info.file.name} file upload failed.`)
            message.error(`Error:  ${info.file.error} in ${info.file.name}`)
            //message.error(`Response:  ${info.file.response}`);
          }
        }}
      >
        <Button icon={<UploadOutlined />}> {t("Add Contacts")}</Button>
      </Upload>
    )
  }

  const countryTableModel = {
    query: query,
    columns: [
      {
        searcheable: true,
        sortable: true,
        field: 'name',
        title: t('Title'),
        renderer: (data: CountrySummary) => (
          <a
            onClick={() => showModal(data.code)} style={{ cursor: 'pointer' }}>
            <span>
              <span style={{ marginRight: 10 }}>{GetCountryFlag(data.code, props.userProfile.countries)}</span>
              {data.name}
            </span>
          </a>
        ),
      },
      {
        field: 'code',
        sortable: false,
        searcheable: true,
        title: t('Code'),
        renderer: (value: CountrySummary) => <span>{value.code}</span>,
      },
      /*{
          field: 'file',
          title: t('Locations'),
          sortable: false,
          searcheable: false,
          renderer: (data: CountrySummary) => (
              Header(data.code)
          ),
      },*/
      //{
      //  field: 'fileC',
      //  title: t('Contacts'),
      //  sortable: false,
      //  searcheable: false,
      //  renderer: (data: CountrySummary) => (
      //    HeaderC(data.code)
      //  ),
      //},

      //{
      //  field: 'fileRC',
      //  sortable: false,
      //  searcheable: false,
      //  renderer: (data: CountrySummary) => (
      //    <span onClick={() => showDeleteContactModal(data.code)} style={{ cursor: 'pointer' }}>
      //      <a> {t('Delete Contacts')} </a>
      //    </span>
      //  ),
      //},

    ],
    data: countryState.value,
    sortFields: [],
  }

  const showDeleteContactModal = async (countryItemId: string) => {
    setLoading(true)
    const item: CountryItem = await countryItemStore.load(countryItemId)

    formC.setFieldsValue({
      code: item.code,
      name: item.name,
      icon: item.icon,
      currency: item.currency
    })
    setDeleteItem(item)
    setVisibleDelete(true)
    setLoading(false)
  }

  const handleCancelDelete = () => {
    setDeleteItem(null)
    setVisibleDelete(false)
  }

  const handleDelete = async () => {
    let item: CountryItem
    try {
      item = await formC.validateFields()
    } catch (e) {
      return
    }

    setModalLoading(true)
    var errorText = ''

    await httpService
      .post(`api/v1/countries/delete-contacts/${item.code}`, item)
      .then((result) => console.log(result))
      .catch((error) => {
        setErrorDeleteContact(error)
        errorText = error
      })
      .finally(() => {
        setModalLoading(false)
        if (errorText == '') {
          setVisibleDelete(false)
          setErrorDeleteContact('')
          formC.resetFields()
          message.success('All contacts form country ' + item.name + ' where deleted')
        }
        else setVisibleDelete(true)
      })

    Load()
    }

    useEffect(() => {
        if (countryState.errorMessage.value !== undefined) {
            messageApi.open({
                type: 'error',
                content: t(countryState.errorMessage.value),
                duration: 5
            })
        }        
    }, [countryState.errorMessage.value])
    
    return (
      <>
      {contextHolder}
      
      <Card title={t('Countries')}>
      
      <Row align={'middle'} justify={'space-between'}>

              <div style={{ width: '100%', marginBottom: '0 5px', overflow: 'hidden' }}>

        <TableView
            canSelect
            rowKey={"code"}
            leftToolbar={leftToolBar()}
            initPagination={initPagination}
            onQueryChanged={(query: Query) => {
                setQuery(query)
                Load(query)
            }}
            onRefresh={() => Load()}
            model={countryTableModel}
            canDelete={true}
            onDeleteRow={(record: CountrySummary) => countryStore.delete(record.code)}
          />
        </div>


        {visibleCountry && (<Modal
          style={{ top: 5 }}
          width={'30%'}
          maskClosable={true}
          visible={visibleCountry}
          title={t('Country Edit')}
          onOk={handleSave}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              {t('Cancel')}
            </Button>,
            <Button key="submit" type="primary" loading={modalLoading} onClick={handleSave}>
              {t('Save')}
            </Button>,
          ]}
        >
          {errorCountry && (<Alert type="error" message={errorCountry} />)}
          <Spin spinning={countryState.isBusy.get()}>
            <Form form={formC} size={'middle'} layout={'horizontal'}>
              <CountryEdit country={editItem} form={formC} />
            </Form>
          </Spin>
        </Modal>
        )}

        {visibleCreateCountry && (<Modal
          style={{ top: 10 }}
          width={'30%'}
          maskClosable={true}
          visible={visibleCreateCountry}
          title={t('Create Country')}
          onOk={handleSaveCreatecountry}
          onCancel={handleCancelCreateCountry}
          footer={[
            <Button key="back" onClick={handleCancelCreateCountry}>
              {t('Cancel')}
            </Button>,
            <Button key="submit" type="primary" loading={modalLoading} onClick={handleSaveCreatecountry}>
              {t('Create')}
            </Button>,
          ]}
        >
          {errorCreateCountry && (<Alert type="error" message={errorCreateCountry} />)}
          <Spin spinning={countryState.isBusy.get()}>
            <Form form={formC} size={'small'} layout={'horizontal'}>
              <CountryCreate country={createCountryItem} form={formC} />
            </Form>
          </Spin>
        </Modal>
        )}

        {visibleDelete && <Modal
          style={{ top: 5 }}
          width={'50%'}
          maskClosable={true}
          visible={visibleDelete}
          title={t('Delete Contacts')}

          onCancel={handleCancelDelete}
          footer={[
            <Button key="submit" type="primary" loading={modalLoading} onClick={handleDelete}>
              {t('Ok')}
            </Button>,
          ]}
        >
          {errorDeleteContact && (<Alert type="error" message={errorDeleteContact} />)}
          <Spin spinning={countryState.isBusy.get()}>
            <Form form={formC} size={'small'} layout={'horizontal'}>
              <Row>
                <Col md={24} sm={24} style={{ padding: '5px' }}>
                  <Form.Item name={nameof<CountryItem>('code')}>
                    <Input size={'middle'} hidden disabled />
                  </Form.Item>
       
                  <Form.Item name={nameof<CountryItem>('name')} >
                    <Input size={'middle'} hidden disabled />
                  </Form.Item>
        
                  <h4 style={{marginTop:-50}}>{t("Do you want delete contacts associated to country")} {t(formC.getFieldValue('name'))}?</h4>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>
        }
      </Row>
            </Card>

        </>
  )
}

export default withTranslation()(withRouter(withUserProfile(CountriesSetting)))
