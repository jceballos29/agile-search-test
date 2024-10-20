import { withTranslation, WithTranslation } from 'react-i18next'
import { FC, useEffect, useState } from 'react'
import { container } from '../../../inversify.config'
import HttpService, { formatMessage } from '../../../core/services/http.service'
import { baseDimensionSummary, Category, GrantFile, GrantItem, GrantItemStore, GrantStatus, GrantSummary, ConfigurationGrantSummaryStore, PublicationType, SourceType } from '../../../stores/grant-store'
import { Alert, Button, Card, Form, message, Modal, Row, Select, Spin, Switch, Tag, Tooltip, DatePicker } from 'antd'
import { TableView } from '../../../core/ui/collections/table'
import { ShowCountryFlag } from '../../../components/flags-icons'
import CountrySelect from '../../../components/country-select'
import { BuildFilters, GrantFilters } from '../../../components/grant-filters'
import DataStore, { Query } from '../../../core/stores/data-store'
import AnnuitySelect from '../../../components/annuity-select'
import { formatDate } from '../../../core/utils/object'
import GrantEdit, { Period } from './grants-edit/grant-edit'
import GrantCreate from './grants-create/grant-create'
import GrantUpload from './grant-upload/grant-upload'
import CountryCreate from '../countries-settings/country-create'
import { IdentityProps } from '../../../core/services/authentication'
import moment from 'moment'
import { CountryItem, CountryItemStore } from '../../../stores/country-store'
import './publication-control-style.less'
import FileSaver from 'file-saver'
import BulkUploadMenu from '../../../components/bulk-upload/bulk-upload-menu'
import { OfficialSourceEnum } from 'src/utils/enums/officialSource.enum'
import { UserProfileProps, withUserProfile } from '../../../components/user-profile'
import { FinancingModalityEnum } from '../../../utils/enums/financingModality.enum'
import { UserOutlined, UserSwitchOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons'
import { typeFilter } from 'src/utils/interfaces'
import { convertNewDate } from 'src/utils/helpers'
import { successNotification } from "../../../components/systemNotification/notificationService"
import LocationSelect from 'src/components/location-select'

const { Option } = Select

interface PublicationControlHomeProps extends WithTranslation, IdentityProps, UserProfileProps, Reloader { }

interface UpdateGrantPublicationControlBody {
  id: string
  title: string
  countryId: string
  annuities: baseDimensionSummary[]
  published: boolean
  category: number
  interest: boolean
  summary: boolean
  fiSuccessRate: number
  projectGroup: string
  observations: string
  webPublished: boolean
  conNewsLetter: boolean
  publicationType: number
  files: GrantFile[]
  openningDate: Date
  closingDate: Date
  publicationDate: Date
  deadline: string
  url: string
  minimis: boolean
  status: GrantStatus
  description: string
  grantBudget: number
  totalBudget: number
  beneficiarySource: number
  source: number
  locations: baseDimensionSummary[]
  beneficiaryTypes: baseDimensionSummary[]
  sectors: baseDimensionSummary[]
  targetSectors: baseDimensionSummary[]
  typologies: baseDimensionSummary[]
  minBudget: number
  maxBudget: number
  warranties: boolean
  advance: boolean
  modalityParticipation: string
  organism: string
  scope: string
  aidIntensity: string
  additionalInformation: string
  publicBodyContactPhone: string
  publicBodyContactEmail: string
  oficialSource: OfficialSourceEnum
  successRate: string
  periods: Period[]
  financingModalityValue: number
  organismUrl: string
  reTranslationManual: ReTranslationManual
  codeBDNS: string[]
  hat: boolean
  contactHat: string
  contactHat2: string
  mirror1: string
  mirror2: string
  mirror3: string
  mirror4: string
}

export interface ReTranslationManual {
  modifyTitle: boolean
  modifyDescription: boolean
  modifyDeadline: boolean
  modifyModalityParticipation: boolean
  modifyGrantIntensity: boolean
  modifyScope: boolean
  modifyAdditionalInformation: boolean
  modifyAidIntensity: boolean
  modifyOrganism: boolean
  modifyFinancingModality: boolean
  modifyObservations: boolean
}

interface CreateGrantPublicationControlBody {
  title: string
  countryId: string
  //language: string;
  publicationDate: Date
  deadline: string
  annuities: baseDimensionSummary[]
  url: string
  minimis: boolean
  status: GrantStatus
  publicationType: number
  description: string
  grantBudget: number
  totalBudget: number
  //currency: string
  beneficiarySource: number
  interest: boolean
  summary: boolean
  source: number
  published: boolean
  category: number
  projectGroup: string
  fiSuccessRate: number
  locations: baseDimensionSummary[]
  beneficiaryTypes: baseDimensionSummary[]
  sectors: baseDimensionSummary[]
  targetSectors: baseDimensionSummary[]
  typologies: baseDimensionSummary[]
  minBudget: number
  maxBudget: number
  warranties: boolean
  advance: boolean
  modalityParticipation: string
  organism: string
  scope: string
  aidIntensity: string
  additionalInformation: string
  publicBodyContactPhone: string
  publicBodyContactEmail: string
  oficialSource: OfficialSourceEnum
  successRate: string
  periods: Period[]
  financingModalityValue: number,
  organismUrl: string,
  codeBDNS: string[]
  hat: boolean
  contactHat: string
  contactHat2: string
  mirror1: string
  mirror2: string
  mirror3: string
  mirror4: string
}

interface Reloader {
  reloadTab?: Boolean
}

const { RangePicker } = DatePicker

const PublicationControl: FC<PublicationControlHomeProps> = (props) => {
  const { t, identity, reloadTab } = props

  const dateFormat = 'YYYY/MM/DD'

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState({} as GrantFilters)
  const [loading, setLoading] = useState(false)

  const [pubParam, setPubParam] = useState(2)

  const [initPagination, setInitPagination] = useState(false)
  const [selectedRows, setSelectedRows] = useState<any[]>([])

  const [createItem, setCreateItem] = useState({} as GrantItem)
  const [editItem, setEditItem] = useState({} as GrantItem)

  const [errorUpdate, setErrorUpdate] = useState('')
  const [visible, setVisible] = useState(false)
  const [visibleCreate, setVisibleCreate] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [pptLoading, setPptLoading] = useState(false)
  const [errorCreate, setErrorCreate] = useState('')

  const [modifyTitle, setModifyTitle] = useState(false)
  const [modifyDescription, setModifyDescription] = useState(false)
  const [modifyDeadline, setModifyDeadline] = useState(false)
  const [modifyModalityParticipation, setModifyModalityParticipation] = useState(false)
  const [modifyGrantIntensity, setModifyGrantIntensity] = useState(false)
  const [modifyScope, setModifyScope] = useState(false)
  const [modifyAdditionalInformation, setModifyAdditionalInformation] = useState(false)
  const [modifyAidIntensity, setModifyAidIntensity] = useState(false)
  const [modifyOrganism, setModifyOrganism] = useState(false)
  const [modifyFinancingModality, setModifyFinancingModality] = useState(false)
  const [modifyObservations, setModifyObservations] = useState(false)

  const [activate, setActivate] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form] = Form.useForm<GrantItem>()
  const [formCreate] = Form.useForm<GrantItem>()

  const [query, setQuery] = useState({
    orderBy: [{ field: 'createdOn', direction: 'Descending', useProfile: false }],
    searchQuery: searchQuery,
    skip: (page - 1) * pageSize,
    take: pageSize,
    parameters: {
      published: pubParam,
      deleted: false
    },
  } as unknown as Query)

  const httpService = container.get(HttpService)
  const currentStore = container.get(ConfigurationGrantSummaryStore)
  const currentState = currentStore.state

  const currentItemStore = container.get(GrantItemStore)
  const currentItemState = currentItemStore.state

  const [formC] = Form.useForm<CountryItem>()
  const [createCountryItem, setcreateCountryItem] = useState({} as CountryItem)
  const [visibleCreateCountry, setVisibleCreateCountry] = useState(false)
  const [errorCreateCountry, setErrorCreateCountry] = useState('')
  const [countries] = useState(props.userProfile.countries)

  const [uploadItem, setUploadItem] = useState({} as GrantItem)
  const [visibleUpload, setVisibleUpload] = useState(false)

  const [showBtnExcelCountry, setShowBtnExcelCountry] = useState(true)
  const [showBtnExcelAnnuity, setShowBtnExcelAnnuity] = useState(true)

  const [idCardDownload, setIdCardDownload] = useState(false);

  const isAdmin = (identity.roles ? identity.roles : [])
    .filter(o =>
      o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant'))?.length > 0;

  const onlyCountryViewer = (identity.roles ? identity.roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

  const countryStore = container.get(CountryItemStore)
  const countryState = countryStore.state

  const [reseter, setReseter] = useState(false)
  let timer = null

  useEffect(() => {
    setLoading(true)
    clearTimeout(timer)
    timer = setTimeout(() => {
      Load(query)
      setLoading(false)
    }, 100)
    return () => {
      clearTimeout(timer)
    }
  }, [query, reloadTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const Load = (searchQuery: Query = query) => {
    searchQuery.filter = BuildFilters(filter)
    currentStore.load(searchQuery)
  }

  const onFilterChanges = (value: any, filterParam: string) => {
    const currentFilter = filter
    currentFilter[filterParam] = Array.isArray(value) ? value.map((x: any) => ({ value: x.value })) : value
    setFilter(currentFilter)
    setPage(1)
    setInitPagination(true)
    query.skip = (page - 1) * pageSize
    if (filterParam == typeFilter.published) {
      setPubParam(value);
      query.parameters['published'] = value;
    }
    if (filterParam == "withDocuments") {
      query.parameters['withDocuments'] = value;
      if (value == 1)
        query.parameters['withDocuments'] = 'true';
      if (value == 2)
        query.parameters['withDocuments'] = 'false';
    }
    if (filterParam == typeFilter.rangePublicationDate) {
      query.parameters['rangePublicationDate'] = value;
    }

    if (filterParam == typeFilter.rangeCreatedDate) {
      query.parameters['rangeCreatedDate'] = value;
    }

    if (filterParam == typeFilter.locations) {
      query.parameters['locations'] = value.map(l => l.value);
    }

    Load(query)
  }

  const translateSimpleFields = (a: any) => {
    if (a) return t(a)
    return a
  }

  const showModal = async (grantItemId: string) => {

    setEditItem(null)
    form.resetFields()
    setLoading(true)
    setErrorUpdate("");
    const [item, targetSectors, sectors, locations, typologies, beneficiaryTypes]: any[] = await Promise.all([
      currentItemStore.load(grantItemId),
      httpService.get(`api/v1/grants/GetGrantTargetSectors/${Number(grantItemId)}`),
      httpService.get(`api/v1/grants/GetGrantSectors/${Number(grantItemId)}`),
      httpService.get(`api/v1/grants/GetGrantLocations/${Number(grantItemId)}`),
      httpService.get(`api/v1/grants/GetGrantTypologies/${Number(grantItemId)}`),
      httpService.get(`api/v1/grants/GetGrantBeneficiaryTypes/${Number(grantItemId)}`),
    ]);
    var initValue = {
      id: item.id,
      published: item.published,
      category: Category[item.category as any] as any,
      interest: item.interest,
      summary: item.summary,
      fiSuccessRate: item.fiSuccessRate,
      projectGroup: item.projectGroup,
      observations: item.observations,
      webPublished: item.webPublished,
      conNewsLetter: item.conNewsLetter,
      publicationType: PublicationType[item.publicationType as any] as any,
      files: item.files,
      publicationDateShow: moment(item.publicationDate),
      deadline: item.deadline,
      url: item.url,
      minimis: item.minimis,
      status: GrantStatus[item.status as any] as any,
      description: item.description,
      grantBudget: item.grantBudget,
      totalBudget: item.totalBudget,
      minBudget: item.minBudget,
      maxBudget: item.maxBudget,
      warranties: item.warranties,
      advance: item.advance,
      beneficiarySource: SourceType[item.beneficiarySource as any] as any,
      source: SourceType[item.source as any] as any,
      countryId: item.countryId,
      title: item.title,
      annuities: item.annuities.map(x => (x.id)) as any,
      sectors: sectors,
      targetSectors: targetSectors.data.items,
      typologies: typologies.data.items,
      typologiesShow: typologies.data.items.map(ts => { return { value: ts.id, label: ts.name } }),
      sectorsShow: sectors.data.items.map(ts => { return { value: ts.id, label: ts.name } }),
      targetSectorsShow: targetSectors.data.items.map(ts => { return { value: ts.id, label: ts.name } }),
      locations: locations,
      locationsShow: locations.data.items.map(ts => { return { value: ts.id, label: ts.name } }),
      beneficiaryTypesShow: beneficiaryTypes.data.items.map(ts => { return { value: ts.id, label: ts.name } }),
      modalityParticipation: item.modalityParticipation,
      organism: item.organism,
      scope: item.scope,
      aidIntensity: item.aidIntensity,
      additionalInformation: item.additionalInformation,
      publicBodyContactPhone: item.publicBodyContactPhone,
      publicBodyContactEmail: item.publicBodyContactEmail,
      oficialSource: item.oficialSource,
      successRate: item.successRate,
      periods: item.periods,
      financingModalityValue: item.financingModalityValue,
      organismUrl: item.organismUrl,
      codesBDNS: item.codesBDNS,
      hat: item.hat,
      contactHat: item.contactHat,
      contactHat2: item.contactHat2,
      mirror1: item.mirror1,
      mirror2: item.mirror2,
      mirror3: item.mirror3,
      mirror4: item.mirror4,
    }
    form.setFieldsValue(initValue);
    setEditItem(item)
    setVisible(true)
    setLoading(false)
  }

  const showModalCreate = async () => {
    setLoading(true)
    setReseter(!reseter)
    setVisibleCreate(true)
    setLoading(false)
  }

  const updateFieldInForm = async (name: any, value: any) => {
    form.setFieldValue(name, value);
  }


  const showModalUpload = async (grantItemId: string) => {

    setLoading(true)
    const item: GrantItem = await currentItemStore.load(grantItemId)
    var initValue = {
      id: item.id,
      published: item.published,
      category: Category[item.category as any] as any,
      interest: item.interest,
      fiSuccessRate: item.fiSuccessRate,
      projectGroup: item.projectGroup,
      observations: item.observations,
      webPublished: item.webPublished,
      conNewsLetter: item.conNewsLetter,
      publicationType: PublicationType[item.publicationType as any] as any,
      files: item.files,
      publicationDateShow: moment(item.publicationDate),
      deadline: item.deadline,
      url: item.url,
      sectors: item.sectors,
      targetSectors: item.targetSectors,
      typologies: item.typologies,
      minimis: item.minimis,
      status: GrantStatus[item.status as any] as any,
      description: item.description,
      grantBudget: item.grantBudget,
      totalBudget: item.totalBudget,
      minBudget: item.minBudget,
      maxBudget: item.maxBudget,
      warranties: item.warranties,
      advance: item.advance,
      beneficiarySource: SourceType[item.beneficiarySource as any] as any,
      source: SourceType[item.source as any] as any,
      aidIntensity: item.aidIntensity,
      additionalInformation: item.additionalInformation,
      publicBodyContactPhone: item.publicBodyContactPhone,
      publicBodyContactEmail: item.publicBodyContactEmail,
      oficialSource: item.oficialSource,
      successRate: item.successRate,
      periods: item.periods,
      financingModalityValue: FinancingModalityEnum[item.financingModalityValue as any] as any,
      codesBDNS: item.codesBDNS
    }


    form.setFieldsValue(initValue)

    setUploadItem(item)
    setVisibleUpload(true)
    setLoading(false)
  }

  const onChangeModify = (text) => {
    switch (text) {
      case 'modifyTitle':
        setModifyTitle(true)
        break;
      case 'modifyDescription':
        setModifyDescription(true)
        break;
      case 'modifyDeadline':
        setModifyDeadline(true)
        break;
      case 'modifyModalityParticipation':
        setModifyModalityParticipation(true)
        break;
      case 'modifyGrantIntensity':
        setModifyGrantIntensity(true)
        break;
      case 'modifyScope':
        setModifyScope(true)
        break;
      case 'modifyAdditionalInformation':
        setModifyAdditionalInformation(true)
        break;
      case 'modifyAidIntensity':
        setModifyAidIntensity(true)
        break;
      case 'modifyOrganism':
        setModifyOrganism(true)
        break;
      case 'modifyFinancingModality':
        setModifyFinancingModality(true)
        break;
      case 'modifyObservations':
        setModifyObservations(true)
        break;
    }
  }

  const validHat = (item: any) => {
    return (item.countryId === 'Es' || item.countryId === 'Eu') ? item.hat : false
  }

  const handleSave = async () => {
    let itemOriginal: GrantItem

    const itemModify: ReTranslationManual = {
      modifyTitle: modifyTitle,
      modifyDescription: modifyDescription,
      modifyDeadline: modifyDeadline,
      modifyModalityParticipation: modifyModalityParticipation,
      modifyGrantIntensity: modifyGrantIntensity,
      modifyScope: modifyScope,
      modifyAdditionalInformation: modifyAdditionalInformation,
      modifyAidIntensity: modifyAidIntensity,
      modifyOrganism: modifyOrganism,
      modifyFinancingModality: modifyFinancingModality,
      modifyObservations: modifyObservations
    }

    try { itemOriginal = (await form.validateFields()) as GrantItem }
    catch (e) {
      return
    }
    setModalLoading(true)
    const item: UpdateGrantPublicationControlBody = {
      id: itemOriginal.id,
      title: itemOriginal.title,
      annuities: itemOriginal.annuities,
      countryId: itemOriginal.countryId,
      beneficiarySource: itemOriginal.beneficiarySource,
      beneficiaryTypes: itemOriginal.beneficiaryTypesShow ? (itemOriginal.beneficiaryTypesShow as any).map((x) => x.value).toArray() : [],
      category: itemOriginal.category,
      closingDate: moment(itemOriginal.closingDateShow).toDate(),
      deadline: itemOriginal.deadline,
      description: itemOriginal.description,
      projectGroup: itemOriginal.projectGroup ? itemOriginal.projectGroup['key'] : '',
      fiSuccessRate: itemOriginal.fiSuccessRate,
      grantBudget: itemOriginal.grantBudget,
      locations: itemOriginal.locationsShow ? (itemOriginal.locationsShow as any).map((x) => x.value).toArray() : [],
      minimis: itemOriginal.minimis,
      openningDate: moment(itemOriginal.openningDateShow).toDate(),
      publicationDate: moment(itemOriginal.publicationDateShow).toDate(),
      publicationType: itemOriginal.publicationType,
      published: itemOriginal.published,
      sectors: itemOriginal.sectorsShow ? (itemOriginal.sectorsShow as any).map((x) => x.value).toArray() : [],
      targetSectors: itemOriginal.targetSectorsShow ? (itemOriginal.targetSectorsShow as any).map((x) => x.value).toArray() : (itemOriginal.targetSectors as any).map((x) => x.id).toArray(),
      typologies: itemOriginal.typologiesShow ? (itemOriginal.typologiesShow as any).map((x) => x.value).toArray() : (itemOriginal.typologies as any).map((x) => x.id).toArray(),
      source: itemOriginal.source,
      status: itemOriginal.status,
      totalBudget: itemOriginal.totalBudget,
      minBudget: itemOriginal.minBudget,
      maxBudget: itemOriginal.maxBudget,
      warranties: itemOriginal.warranties,
      advance: itemOriginal.advance,
      url: itemOriginal.url,
      webPublished: itemOriginal.webPublished,
      interest: itemOriginal.interest,
      summary: itemOriginal.summary,
      observations: itemOriginal.observations,
      conNewsLetter: itemOriginal.conNewsLetter,
      files: itemOriginal.files,
      modalityParticipation: itemOriginal.modalityParticipation,
      organism: itemOriginal.organism,
      scope: itemOriginal.scope,
      aidIntensity: itemOriginal.aidIntensity,
      additionalInformation: itemOriginal.additionalInformation,
      publicBodyContactPhone: itemOriginal.publicBodyContactPhone,
      publicBodyContactEmail: itemOriginal.publicBodyContactEmail,
      oficialSource: itemOriginal.oficialSource,
      successRate: itemOriginal.successRate,
      periods: itemOriginal.periods,
      financingModalityValue: itemOriginal.financingModalityValue,
      organismUrl: itemOriginal.organismUrl,
      reTranslationManual: itemModify,
      codeBDNS: itemOriginal.codesBDNS,
      hat: validHat(itemOriginal),
      contactHat: validHat(itemOriginal) ? itemOriginal.contactHat : '',
      contactHat2: validHat(itemOriginal) ? itemOriginal.contactHat2 : '',
      mirror1: validHat(itemOriginal) ? itemOriginal.mirror1 : '',
      mirror2: validHat(itemOriginal) ? itemOriginal.mirror2 : '',
      mirror3: validHat(itemOriginal) ? itemOriginal.mirror3 : '',
      mirror4: validHat(itemOriginal) ? itemOriginal.mirror4 : '',
    }


    var errorText = ''
    await httpService
      .put(`api/v1/grants/edit-grant/${item.id}`, item)
      .then((result) => console.log(result))
      .catch((error) => {
        setErrorUpdate(error)
        errorText = error
      })
      .finally(() => {
        setModalLoading(false)
        if (errorText == '') {
          setVisible(false)
          setErrorUpdate('')
          setEditItem(null)
          form.resetFields()
        }
        else setVisible(true)
      })

    Load()
  }

  const handleSaveCreate = async () => {
    setSaving(false)
    let itemOriginal: GrantItem;
    try {
      itemOriginal = await formCreate.validateFields()
    }
    catch (e) {
      return
    }
    const item: CreateGrantPublicationControlBody = {
      title: itemOriginal.title,
      annuities: itemOriginal.annuities == null ? [] : itemOriginal.annuities,
      beneficiarySource: itemOriginal.beneficiarySource,
      beneficiaryTypes: itemOriginal.beneficiaryTypes ? (itemOriginal.beneficiaryTypes as any).map((x) => x.key).toArray() : [],
      category: itemOriginal.category,
      countryId: itemOriginal.countryId,
      deadline: itemOriginal.deadlineString?.toString(),
      description: itemOriginal.description,
      projectGroup: itemOriginal.projectGroup ? itemOriginal.projectGroup['key'] : '',
      fiSuccessRate: itemOriginal.fiSuccessRate,
      grantBudget: itemOriginal.grantBudget,
      locations: itemOriginal.locations ? (itemOriginal.locations as any).map((x) => x.key).toArray() : [],
      minimis: itemOriginal.minimis,
      interest: itemOriginal.interest,
      summary: itemOriginal.summary,
      publicationDate: moment(itemOriginal.publicationDate).toDate(),
      publicationType: itemOriginal.publicationType,
      published: itemOriginal.published,
      sectors: itemOriginal.sectors ? (itemOriginal.sectors as any).map((x) => x.value).toArray() : [],
      targetSectors: itemOriginal.targetSectors ? (itemOriginal.targetSectors as any).map((x) => x.value).toArray() : [],
      typologies: itemOriginal.typologies ? (itemOriginal.typologies as any).map((x) => x.key).toArray() : [],
      source: itemOriginal.source,
      status: itemOriginal.status,
      totalBudget: itemOriginal.totalBudget,
      minBudget: itemOriginal.minBudget,
      maxBudget: itemOriginal.maxBudget,
      warranties: itemOriginal.warranties,
      advance: itemOriginal.advance,
      url: itemOriginal.url,
      modalityParticipation: itemOriginal.modalityParticipation,
      organism: itemOriginal.organism,
      scope: itemOriginal.scope,
      aidIntensity: itemOriginal.aidIntensity,
      additionalInformation: itemOriginal.additionalInformation,
      publicBodyContactPhone: itemOriginal.publicBodyContactPhone,
      publicBodyContactEmail: itemOriginal.publicBodyContactEmail,
      oficialSource: itemOriginal.oficialSource,
      successRate: itemOriginal.successRate,
      periods: itemOriginal.periods,
      financingModalityValue: itemOriginal.financingModalityValue,
      organismUrl: itemOriginal.organismUrl,
      codeBDNS: itemOriginal.codesBDNS,
      hat: validHat(itemOriginal),
      contactHat: validHat(itemOriginal) ? itemOriginal.contactHat : '',
      contactHat2: validHat(itemOriginal) ? itemOriginal.contactHat2 : '',
      mirror1: validHat(itemOriginal) ? itemOriginal.mirror1 : '',
      mirror2: validHat(itemOriginal) ? itemOriginal.mirror2 : '',
      mirror3: validHat(itemOriginal) ? itemOriginal.mirror3 : '',
      mirror4: validHat(itemOriginal) ? itemOriginal.mirror4 : '',
    }

    setModalLoading(true)
    var errorText = ''
    await httpService
      .post(`api/v1/grants/`, item)
      .then((result) => console.log(result))
      .catch((error) => {
        setErrorCreate(error)
        errorText = error
      })
      .finally(() => {
        setModalLoading(false)
        if (errorText == '') {
          setVisibleCreate(false)
          setErrorCreate('')
          formCreate.resetFields()
          formCreate.setFieldsValue({ codesBDNS: [] })
        }
        else setVisibleCreate(true)
      })
    Load()
  }

  const handleSaveCreatecountry = async () => {
    let item: CountryItem
    try { item = await formC.validateFields() }
    catch (e) { return }

    setModalLoading(true)
    var errorText = ''

    await httpService
      .post(`api/v1/countries/`, item)
      .then((result) => console.log(result))
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
      })
    Load()
  }

  useEffect(() => {
    if (saving) handleSaveCreate()
  }, [saving])

  const handleCancel = () => {
    setEditItem(null)
    setVisible(false)
    form.resetFields()

  }

  //FUNCION PARA CANCELAR EL "CREATE GRANT" CON SU RESPECTIVO HOOK
  const handleCancelCreate = () => {
    setCreateItem(null)
    setVisibleCreate(false)
    formCreate.resetFields()
    setActivate(false)

  }

  useEffect(() => {
    if (activate) {
      handleCancelCreate()
    }
  }, [activate])


  const handleCancelCreateCountry = () => {
    setcreateCountryItem(null)
    setVisibleCreateCountry(false)
    formC.resetFields()
  }

  const handleCancelUpload = () => {
    setUploadItem(null)
    setVisibleUpload(false)
  }


  const publishGrants = async (status: boolean) => {
    setLoading(true)
    const result = await httpService.post('api/v1/grants/published', {
      published: status,
      grantids: selectedRows,
    })

    if (result && status) { message.success(t('Grants successfully published')) }
    else if (result && !status) { message.success(t('Grants successfully unpublished')) }
    Load()
    setLoading(false)
  }

  const publishGrantOnSwitch = async (value: boolean, item: GrantSummary) => {
    setLoading(true)
    await httpService.post('api/v1/grants/published', {
      published: value,
      grantids: [item.id],
    })
    Load()
    setLoading(false)
  }

  const summaryGrantOnSwitch = async (value: boolean, item: GrantSummary) => {
    setLoading(true)
    await httpService.post('api/v1/grants/summary', {
      published: value,
      grantids: [item.id],
    })
    Load()
    setLoading(false)
  }

  const interestGrantOnSwitch = async (value: boolean, item: GrantSummary) => {
    setLoading(true)
    await httpService.post('api/v1/grants/interest', {
      published: value,
      grantids: [item.id],
    })
    Load()
    setLoading(false)
  }

  const webPublishGrantOnSwitch = async (value: boolean, item: GrantSummary) => {
    setLoading(true)
    await httpService.post('api/v1/grants/webPublished', {
      published: value,
      grantids: [item.id],
    })
    Load()
    setLoading(false)
  }

  const conNewsletterGrantOnSwitch = async (value: boolean, item: GrantSummary) => {
    setLoading(true)
    await httpService.post('api/v1/grants/conNewsteller', {
      published: value,
      grantids: [item.id],
    })
    Load()
    setLoading(false)
  }

  const deleteGrants = async (status: boolean) => {
    setLoading(true)
    const result = await httpService.post('api/v1/grants/deleted', {
      deleted: status,
      grantids: selectedRows,
    })
    if (result && status) { message.success(t('Grants successfully deleted')) }
    Load()
    setLoading(false)
  }

  const downloadExcelTemplate = async () => {
    setLoading(true)
    let x = query
    x.skip = 0
    x.take = 1000000
    await httpService.post(`api/v1/grants/assigntemplate?` + DataStore.buildUrl(x), {})
    successNotification(t('Operation Completed Successfully'), t('Your operation will be processed in background'))
    setLoading(false)
  }


  //-handle Create
  const handleDownloadPowerPoint = async (grantId: number) => {
    setPptLoading(true)
    handleDownloadPowerPointFinal(grantId)
  }

  const handleDownloadPowerPointFinal = async (grantId: number) => {
    const result = await httpService.get(`api/v1/grants/grantSlide/${grantId}`, {
      responseType: 'arraybuffer'
    })
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, `${currentItemState.item.title}.pptx`);
    setPptLoading(false)
  }

  const bulkUploadOptions = [{
    optionLabel: t('Bulk Insert Grants'),
    modalName: t('Bulk Insert Grants'),
    bulkInsertTemplateName: t('Template import Grants'),
    bulkInsertTemplateUrl: `api/v1/grants/template`,
    bulkInsertUrl: `api/v1/grants/bulk_insert`,
  }]

  const bulkEditOptions = [{
    optionLabel: t('Bulk Edit Grants'),
    modalName: t('Bulk Edit Grants'),
    bulkInsertTemplateName: t('Template import Grants'),
    bulkInsertTemplateUrl: `api/v1/grants/template_edit`,
    bulkInsertUrl: `api/v1/grants/bulk_edit`,
  }]

  const leftToolBar = () => (
    <>
      <div className="main-column">
        <div className="row-buttons">
          <Button type="primary" onClick={showModalCreate} style={{ marginRight: 20, minWidth: 200 }}>
            {t("Create Grant")}
          </Button>
          {props.userProfile.isFullAdmin ?
            <BulkUploadMenu options={bulkUploadOptions} simple />
            : <></>}
          {ValidPublish(selectedRows) && (
            <Button
              type={'primary'}
              ghost
              onClick={() => publishGrants(true)}
              loading={loading}
              style={{
                minWidth: loading ? 180 : 150,
                width: 'fit-content',
                padding: '0px 5px',
                marginRight: 20,
              }}
            >
              {t('Publish')}
            </Button>
          )}

          {props.userProfile.isFullAdmin ?
            <BulkUploadMenu options={bulkEditOptions} simple />
            : <></>}
          {ValidPublish(selectedRows) && (
            <Button
              type={'primary'}
              ghost
              onClick={() => publishGrants(true)}
              loading={loading}
              style={{
                minWidth: loading ? 180 : 150,
                width: 'fit-content',
                padding: '0px 5px',
                marginRight: 20,
              }}
            >
              {t('Publish')}
            </Button>
          )}

          {ValidUnpublished(selectedRows) && (
            <Button
              danger
              onClick={() => publishGrants(false)}
              loading={loading}
              style={{
                minWidth: loading ? 200 : 170,
                padding: '0px 5px',
                marginRight: 20,
              }}
            >
              {t('UnPublish')}
            </Button>
          )}


          {ValidDelete(selectedRows) && (
            <Button
              danger
              onClick={() => deleteGrants(true)}
              loading={loading}
              style={{
                minWidth: loading ? 200 : 170,
                padding: '0px 5px',
                marginRight: 20,
              }}
            >
              {t('Delete')}
            </Button>
          )}


          <Button
            type="primary"
            ghost
            disabled={showBtnExcelCountry === false || showBtnExcelAnnuity === false ? false : true}
            onClick={() => downloadExcelTemplate()}
            loading={loading}
            style={{
              minWidth: loading ? 200 : 170,
              padding: '0px 5px',
              marginRight: 20,
            }}
          >
            {t('Export excel')}
          </Button>

        </div>

        <div className="row-filters" style={{ gap: 10 }}>
          <Select
            placeholder={t('Filter by Published')}
            dropdownMatchSelectWidth
            defaultActiveFirstOption
            defaultValue={2}
            style={{ minWidth: 200 }}
            onChange={(value: number) => onFilterChanges(value, typeFilter.published)}
          >
            <Option key={'All'} value={2}>{t('All')}</Option>
            <Option key={'Published'} value={0}>{t('Published')}</Option>
            <Option key={'Not Published'} value={1}>{t('Not Published')}</Option>
          </Select>

          <Select
            value={filter.grantTypeInsert}
            placeholder={t('Insert type')}
            dropdownMatchSelectWidth
            allowClear
            labelInValue
            mode={"multiple"}
            style={{ minWidth: 200 }}
            onChange={(value: any) => onFilterChanges(value, typeFilter.grantTypeInsert)}
            maxTagCount={1}
          >
            <Option key={1} value={1}>{t('Manuals')}</Option>
            <Option key={2} value={2}>{t('Sharepoint')}</Option>
            <Option key={3} value={3}>{t('Automatic')}</Option>
            <Option key={4} value={4}>{t('Excel')}</Option>
          </Select>

          <Select
            value={filter.category}
            placeholder={t('Filter by Category')}
            dropdownMatchSelectWidth
            allowClear
            labelInValue
            mode={"multiple"}
            style={{ minWidth: 150 }}
            onChange={(value: any) => onFilterChanges(value, typeFilter.category)}
            maxTagCount={1}
          >
            <Option key={'A'} value={1}>{t('A')}</Option>
            <Option key={'B'} value={2}>{t('B')}</Option>
            <Option key={'C'} value={3}>{t('C')}</Option>
            <Option key={'D'} value={4}>{t('D')}</Option>
            <Option key={'E'} value={5}>{t('E')}</Option>
          </Select>

          <CountrySelect
            nullable
            labelInValue={true}
            mode={'multiple'}
            placeholder={t('Filter by Country')}
            value={filter.countries}
            onChange={(value) => {
              setShowBtnExcelCountry(value === undefined ? true : false)
              onFilterChanges(value, typeFilter.countries)
            }
            }
            width={"auto"}
            minWidth={200}
            maxTagCount={1}
          />

          <AnnuitySelect
            mode={'multiple'}
            labelInValue={true}
            placeholder={t('Filter by Annuity')}
            value={filter.annuities}
            onChange={(value) => {
              setShowBtnExcelAnnuity(value.length === 0 ? true : false)
              onFilterChanges(value, typeFilter.annuities)
            }
            }
            width={"auto"}
            minWidth={200}
            maxTagCount={1}
          />

          <Select
            placeholder={t('Filter by Interest')}
            dropdownMatchSelectWidth
            defaultActiveFirstOption
            allowClear
            style={{ minWidth: 200 }}
            onChange={(value: number) => onFilterChanges(value, typeFilter.interest)}
          >
            <Option key={'Yes'} value={1}>{t('Interest')}</Option>
            <Option key={'No'} value={0}>{t('Not Interest')}</Option>
          </Select>

          <Select
            placeholder={t('Documents options')}
            dropdownMatchSelectWidth
            defaultActiveFirstOption
            allowClear
            style={{ minWidth: 200 }}
            onChange={(value: number) => onFilterChanges(value, "withDocuments")}
          >
            <Option key={'Yes'} value={1}>{t('With Documents')}</Option>
            <Option key={'No'} value={2}>{t('No Documents')}</Option>
          </Select>

          <LocationSelect
            placeholder={t("Filter by Region")}
            width="auto" minWidth={200}
            fullLoad={filter.countryId == null}
            countries={filter.countries}
            onChange={(value: any) => onFilterChanges(value, "locations")}
            maxTagCount={1}
          />

          <RangePicker
            aria-required
            style={{ maxWidth: 350, marginRight: 10 }}
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode as HTMLElement
            }}
            format={dateFormat}
            placeholder={[t('Opening Publication Date'), t('Closing Publication Date')]}
            onChange={(value, dateString) => onFilterChanges(dateString, typeFilter.rangePublicationDate)}
          />

          <RangePicker
            aria-required
            style={{ maxWidth: 350 }}
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode as HTMLElement
            }}
            format={dateFormat}
            placeholder={[t('Opening Created Date'), t('Closing Created Date')]}
            onChange={(value, dateString) => onFilterChanges(dateString, typeFilter.rangeCreatedDate)}
          />
        </div>
      </div>
    </>
  )

  const GetLocations = (locations: baseDimensionSummary[]) => {
    return locations.map(x =>
      <Tag color="blue" style={{ marginBottom: 5, whiteSpace: 'break-spaces' }}>{x.name}</Tag>
    )
  }

  const grantTableModel = {
    query: query,
    columns: [
      {
        field: 'published',
        title: t('Published'),
        renderer: (value: GrantSummary) => (
          <Switch
            onClick={(checked: boolean) => {
              publishGrantOnSwitch(checked, value)
                .then()
                .finally(() => {
                  if (checked) {
                    message.success(t('Grants successfully published'))
                  } else {
                    message.success(t('Grants successfully unpublished'))
                  }
                })
            }}
            checked={value.published}
          />

        ),
        fixed: 'left',
        width: '90px'
      },
      {
        field: 'summary',
        title: t('Summary'),
        renderer: (value: GrantSummary) => (
          <Switch
            onClick={(checked: boolean) => {
              summaryGrantOnSwitch(checked, value)
                .then()
                .finally(() => {
                  if (checked) {
                    message.success(t('Grants successfully summary on'))
                  } else {
                    message.success(t('Grants successfully summary off'))
                  }
                })
            }}
            checked={value.summary}
          />

        ),
        fixed: 'left',
        width: '90px'
      },
      {
        sortable: true,
        searcheable: true,
        field: 'id',
        title: t('Id'),
        renderer: (value: GrantSummary) => (
          <span onClick={() => showModal(value.id)} style={{ cursor: 'pointer' }}>
            {value.id} {value.isUserCustomized && <span style={{ color: '#0000A4' }}><UserSwitchOutlined /></span>}
          </span >
        ),
        fixed: 'left',
        width: '90px'
      },
      {
        searcheable: true,
        field: 'title',
        title: t('Title'),
        renderer: (value: GrantSummary) => (
          <span onClick={() => showModal(value.id)} style={{ cursor: 'pointer' }}>
            <span style={{ marginRight: 10 }}>{ShowCountryFlag(value.countryId, countries)}</span>
            <Tooltip title={value.description}>

              <>
                {value.title && ` ${value.title?.slice(0, 100)} ${value.title?.length > 100 ? '...' : ''}`}
                {!value.title && value.description && `[${value.id}] ${value.description?.slice(0, 100)} ${value.description?.length > 100 ? '...' : ''}`}
                {!value.description && !value.title && 'No Title or Description Provided'}
              </>

            </Tooltip>
          </span >
        ),
        fixed: 'left',
        width: '15%'
      },
      {
        field: 'locations',
        sortable: false,
        searcheable: false,
        title: t('Region'),
        renderer: (value: GrantSummary) => <span>{GetLocations(value.locations)}</span>,

      },
      {
        field: 'publicationDate',
        sortable: true,
        searcheable: false,
        title: t('Publication Date'),
        renderer: (value: GrantSummary) =>
          <span>{value.publicationDate && convertNewDate(value.publicationDate)}</span>

      },

      {
        field: 'beneficiarySource',
        sortable: false,
        searcheable: false,
        title: t('Beneficiary Source'),
        renderer: (value: GrantSummary) => <span>{<Tag color="red">{translateSimpleFields(value.beneficiarySource)}</Tag>}</span>,
      },
      {
        field: 'source',
        sortable: false,
        searcheable: false,
        title: t('Source'),
        renderer: (value: GrantSummary) => <span>{<Tag color="red">{translateSimpleFields(value.source)}</Tag>}</span>,
      },
      {
        field: 'interest',
        title: t('Interest'),
        width: '80px',
        renderer: (value: GrantSummary) => (
          <Switch
            onClick={(checked: boolean) => {
              interestGrantOnSwitch(checked, value)
                .then()
                .finally(() => {
                  if (checked) {
                    message.success(t('Grants successfully interest on'))
                  } else {
                    message.success(t('Grants successfully interest off'))
                  }
                })
            }}
            checked={value.interest}
          />

        ),
      },
      {
        field: 'webPublished',
        title: t('Web Published'),
        width: '95px',
        renderer: (value: GrantSummary) => (
          <Switch
            onClick={(checked: boolean) => {
              webPublishGrantOnSwitch(checked, value)
                .then()
                .finally(() => {
                  if (checked) {
                    message.success(t('Grants successfully web published'))
                  } else {
                    message.success(t('Grants successfully web unpublished'))
                  }
                })
            }}
            checked={value.webPublished}
          />

        ),
      },
      {
        field: 'conNewsLetter',
        title: t('CON Newsletter'),
        width: '95px',
        renderer: (value: GrantSummary) => (
          <Switch
            onClick={(checked: boolean) => {
              conNewsletterGrantOnSwitch(checked, value)
                .then()
                .finally(() => {
                  if (checked) {
                    message.success(t('Grants successfully set Con NewsLetter on'))
                  } else {
                    message.success(t('Grants successfully set Con NewsLetter off'))
                  }
                })
            }}
            checked={value.conNewsLetter}
          />

        ),
      },
      {
        field: 'createdOn',
        sortable: true,
        searcheable: false,
        title: t('Created on'),
        renderer: (value: GrantSummary) => <span>{value.createdOn && formatDate(value.createdOn)}</span>,
      },
      {
        field: 'modifiedOn',
        sortable: true,
        searcheable: false,
        title: t('Modified On'),
        renderer: (value: GrantSummary) => <span>{value.modifiedOn && formatDate(value.modifiedOn)}</span>,
      },
      {
        field: 'modifiedBy',
        sortable: false,
        searcheable: false,
        title: t('Modified By'),
        renderer: (value: GrantSummary) => <span><UserOutlined style={{ marginRight: "5px" }} />{value.modifiedBy}</span>,
      },
      {
        field: 'category',
        sortable: true,
        searcheable: false,
        title: t('Category'),
        renderer: (value: GrantSummary) => <Tag color={'green'}>{t(value.category)}</Tag>,
        width: '110px',
      },
      {
        field: 'openningDate',
        sortable: true,
        searcheable: false,
        title: t('Opening Date'),
        renderer: (value: GrantSummary) =>
          <span>
            {
              value.periods && value.periods.length > 0 &&
              value.periods.map((period) => (
                <>
                  <span>{period.openningDate && convertNewDate(period.openningDate)}</span>
                  <br />
                </>
              ))
            }
          </span>,
      },
      {
        field: 'field',
        sortable: false,
        searcheable: false,
        title: t('Files'),
        width: '95px',
        renderer: (value: GrantSummary) => (
          <>
            <div className="container-button">
              <span onClick={() => showModalUpload(value.id)} style={{ cursor: 'pointer' }}>
                <a><i className="fa-solid fa-cloud-arrow-up"></i> </a>
              </span>

              <span onClick={() => handleDownloadPowerPoint(Number(value.id))
              } style={{ cursor: 'pointer' }}>
                {value.category == 'A' ?
                  <a>
                    {pptLoading == true ?
                      <span className="icn-spinner">
                        <i className="fa-solid fa-spinner"></i>
                      </span>
                      :
                      <i className="fa-sharp fa-solid fa-file-powerpoint"></i>
                    }
                  </a>
                  : null
                }
              </span>
            </div>
          </>
        )
      }
    ],
    data: currentState.value,
    sortFields: [],
  }

  const ValidPublish = (rowKeys: any[]): boolean => {
    const selectedItems = currentState.value.items.filter((i) => rowKeys.includes(i.id))
    const valid = selectedItems.all((i) => !i.published)

    return valid && selectedItems.length > 1
  }

  const ValidUnpublished = (rowKeys: any[]): boolean => {
    const selectedItems = currentState.value.items.filter((i) => rowKeys.includes(i.id))
    const valid = selectedItems.all((i) => i.published)

    return valid && selectedItems.length > 1
  }

  const ValidDelete = (rowKeys: any[]): boolean => {
    const selectedItems = currentState.value.items.filter((i) => rowKeys.includes(i.id))
    const valid = selectedItems.all((i) => !i.published)

    return valid && selectedItems.length > 0
  }

  const onChangePeriod = (periods: Period[]) => {
    let grantAux = editItem
    grantAux.periods = periods
    setEditItem(grantAux)
  }

  const handleDownloadIdCard = async (grantId: Number) => {
    setIdCardDownload(true);
    const result = await httpService.get(`api/v1/grants/grantSlide/${grantId}`, {
      responseType: 'arraybuffer'
    })
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, `${currentItemState.item.title}.pptx`)
    setIdCardDownload(false);
  }

  return (
    <>
      {
        <Card className='publication-control'>
          <Row align={'middle'} justify={'space-between'}>
            <div style={{ width: '100%', marginBottom: '0 10px', overflow: 'hidden' }}>
              {
                pptLoading ?

                  <Spin tip="Downloading PPT Presentation..." size="large">
                    <TableView
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
                      model={grantTableModel}
                      error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
                    />
                  </Spin>
                  :
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
                      ValidPublish(rowKeys)
                      ValidUnpublished(rowKeys)
                      ValidDelete(rowKeys)
                    }}
                    onRefresh={() => Load()}
                    searchOnEnter
                    model={grantTableModel}
                    error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
                    scroll={{ x: 2000, y: '70vh' }}
                  />
              }

            </div>

            <Modal
              style={{ top: 10 }}
              width={'80%'}
              maskClosable={true}
              visible={visible}
              title={t('Grant Edit')}
              onOk={handleSave}
              onCancel={handleCancel}
              footer={[
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {!onlyCountryViewer ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Spin spinning={idCardDownload}>
                        <Tooltip title={t('Download ID Card')} zIndex={10000}>
                          <Button type='primary' onClick={() => handleDownloadIdCard(Number(editItem.id))} icon={<VerticalAlignBottomOutlined />}>
                            {t('Download ID Card')}
                          </Button>
                        </Tooltip>
                      </Spin>
                    </div>) : <></>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button key="back" onClick={handleCancel}>
                      {t('Cancel')}
                    </Button>
                    <Button key="submit" type="primary" loading={modalLoading} onClick={handleSave}>
                      {t('Save')}
                    </Button>
                  </div>
                </div>
              ]}
            >
              {errorUpdate && (<Alert type="error" message={t(errorUpdate)} />)}
              <Spin spinning={currentItemState.isBusy.get()}>
                {visible && (
                  <Form form={form} size={'middle'} layout={'horizontal'}>
                    <GrantEdit onChangePeriod={(periods) => { onChangePeriod(periods) }} grant={editItem} url={currentStore.baseUrl} identity={identity}
                      onChangeModify={onChangeModify} updateFieldInForm={updateFieldInForm} />
                  </Form>
                )}
              </Spin>
            </Modal>


            <Modal
              className='create-grant'
              style={{ top: 10 }}
              width={'50%'}
              maskClosable={false}
              visible={visibleCreate}
              title={t('Create Grant')}
              onOk={handleSaveCreate}
              onCancel={handleCancelCreate}
              footer={[<></>]}
            >

              {errorCreate && (<Alert type="error" message={t(errorCreate)} />)}
              <Spin spinning={currentItemState.isBusy.get()}>
                {visibleCreate && (
                  <Form form={formCreate} size={'middle'} layout={'horizontal'}>
                    <GrantCreate grant={createItem} url={currentStore.baseUrl} identity={identity} setActivate={setActivate} setSaving={setSaving} loading={modalLoading}
                      reseter={reseter} updateFieldInForm={updateFieldInForm} />
                  </Form>
                )}
              </Spin>

            </Modal>


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
              {errorCreateCountry && (<Alert type="error" message={t(errorCreateCountry)} />)}
              <Spin spinning={countryState.isBusy.get()}>
                <Form form={formC} size={'small'} layout={'horizontal'}>
                  <CountryCreate country={createCountryItem} form={formC} />
                </Form>
              </Spin>
            </Modal>
            )}

            {visibleUpload && <Modal
              style={{ top: 10 }}
              width={'50%'}
              maskClosable={true}
              visible={visibleUpload}
              title={t('Upload Files')}

              onCancel={handleCancelUpload}
              footer={[

              ]}
            >
              <Form form={form} size={'middle'} layout={'horizontal'}>
                <GrantUpload grant={uploadItem} url={currentStore.baseUrl} identity={identity} />
              </Form>

            </Modal>
            }
          </Row>
        </Card>
      }



    </>
  )
}

export default withUserProfile(withTranslation()(PublicationControl))
