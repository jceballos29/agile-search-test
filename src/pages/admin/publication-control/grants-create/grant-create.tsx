import { withTranslation, WithTranslation } from 'react-i18next'
import { GrantItem, GrantStatus, SourceType } from '../../../../stores/grant-store'
import React, { FC, useEffect, useState } from 'react'
import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Radio } from 'antd'
import FormItem from 'antd/lib/form/FormItem'
import TextArea from 'antd/es/input/TextArea'
import AnnuitySelect from 'src/components/annuity-select'
import CountrySelect from 'src/components/country-select'
import LocationSelect from 'src/components/location-select'
import SectorAllSelect from 'src/components/sector-AllSelect'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import { IdentityProps } from '../../../../core/services/authentication'
import './grant-create-style.less'
import TypologySelect from '../../../../components/typology-select'
import { enumSelector } from 'src/utils/enums/enumSelector'
import { OfficialSourceEnum } from 'src/utils/enums/officialSource.enum'
import moment from 'moment'
import { UserProfileProps, withUserProfile } from '../../../../components/user-profile'
import { Period } from '../grants-edit/grant-edit'
import DatePeriods from 'src/components/periods/datePeriods'
import { FinancingModalityEnum } from 'src/utils/enums/financingModality.enum'
import TargetSectorAllSelect from '../../../../components/targetSector-AllSelect'
import ProjectGroupSelect from '../../../../components/projectGroup-select'
import { LinkOutlined } from '@ant-design/icons'
import { nameof } from '../../../../core/utils/object'

interface GrantEditProps extends WithTranslation, IdentityProps, UserProfileProps {
  url: string
  grant: GrantItem
  setActivate: any
  setSaving: any
  loading: any
  reseter: boolean
  updateFieldInForm: (name: any, value: any) => void;
}

const GrantEdit: FC<GrantEditProps> = (props) => {
  const { t, grant, identity, setActivate, setSaving, loading, reseter, updateFieldInForm } = props

  const [fullLoad, setFullLoad] = useState(false)
  const [countryId, setcountryId] = useState(null)

  const [titleValidate, setTitleValidate] = useState('')
  const [countryValidate, setCountryValidate] = useState('')
  const [annuityValidate, setAnnuityValidate] = useState(0)
  const [projectsGroupValidate, setProjectsGroupValidate] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [errFieldRequired, setErrFieldRequired] = useState(false)
  const [grantPeriods, setGrantPeriods] = useState<Period[]>([]);
  const officialSourceEnum = enumSelector(OfficialSourceEnum);
  const financingModalityEnum = enumSelector(FinancingModalityEnum);
  const [codeBDNSValidate, setCodeBDNSValidate] = useState([]);
  const [displayValidatehat, setDisplayValidatehat] = useState(null)
  const [displayValidateContactHat, setDisplayValidateContactHat] = useState(null)
  const [contactHatValidate, setContactHatValidate] = useState('')
  const [isCheckHat, setIsCheckHat] = useState(false)


  const options = [GrantStatus.Open, GrantStatus.Closed, GrantStatus.PendingPublication]

  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0

  const isRealAdmin = props.userProfile.isAdmin;

  useEffect(() => {
    setFullLoad(true)
    //load(buildQuery());
  }, []) // eslint-disable-line react-hooks/exhaustive-deps  

  //TABS HEADERS
  const changeActive = (e) => {

    let fieldRequireds = document.querySelectorAll('.tabs-create .tab-content > div .col-required')

    if (pageNumber == 1 && titleValidate.trim().length == 0) {

      fieldRequireds[0].classList.add('col-error')
      setErrFieldRequired(true)

    } else if (
      (pageNumber === 2 && annuityValidate < 1) ||
      (pageNumber === 2 && countryValidate.trim().length === 0) ||
      (pageNumber === 2 && (countryId === 'Es' || countryId === 'Eu') && (displayValidatehat === null || displayValidatehat)) ||
      (pageNumber === 2 && contactHatValidate.trim().length === 0 && isCheckHat)) {

      if (pageNumber === 2 && annuityValidate < 1) {
        fieldRequireds[1].classList.add('col-error')
        setErrFieldRequired(true)
      }

      if (pageNumber === 2 && countryValidate.trim().length === 0) {
        fieldRequireds[2].classList.add('col-error')
        setErrFieldRequired(true)
      }

      if (pageNumber === 2 && (displayValidatehat === null || displayValidatehat)) {
        setDisplayValidatehat(true)
        setErrFieldRequired(true)
      }

      if (pageNumber === 2 && contactHatValidate.trim().length === 0 && isCheckHat) {
        setDisplayValidateContactHat(true)
        setErrFieldRequired(true)
      }


    }
    else if (pageNumber === 5 && projectsGroupValidate.trim().length === 0 && countryId === 'Es') {

      fieldRequireds[7].classList.add('col-error')
      setErrFieldRequired(true)

    }

    else {
      let tabHeaders = document.querySelectorAll('.tabs-create .tab-header > div')
      let tabContents = document.querySelectorAll('.tabs-create .tab-content > div')
      let progressBar = document.querySelectorAll('.tabs-create .tab-header .step .bullet')
      let checkIcon = document.querySelectorAll('.tabs-create .tab-header .step .check')

      for (let i = 0; i < fieldRequireds.length; i++) {
        fieldRequireds[i].classList.remove('col-error')
      }
      setErrFieldRequired(false)

      for (let i = 0; i < tabHeaders.length; i++) {
        tabHeaders[i].classList.remove('active')
        tabContents[i].classList.remove('active')
        progressBar[i].classList.remove('active')
        checkIcon[i].classList.remove('active')
      }

      e.currentTarget.classList.add('active')

      let aux

      for (let i = 0; i < tabHeaders.length; i++) {
        if (tabHeaders[i].className === 'step active') {
          aux = i
        }
      }

      for (let i = 0; i < aux; i++) {
        progressBar[i].classList.add('active')
        checkIcon[i].classList.add('active')
      }

      tabContents[aux].classList.add('active')
      setPageNumber(aux + 1)
    }

  }

  //TABS CONTENT   

  //ACTIVADORES ON CLICK
  const handleCancelCreateActivate = () => {
    setActivate(true)
    setTitleValidate('')
    setCountryValidate('')
    setAnnuityValidate(0)
    setIsCheckHat(false)
    setDisplayValidatehat(null)
    setDisplayValidateContactHat(null)

    let tabContents = document.querySelectorAll('.tabs-create .tab-content > div')
    let tabHeaders = document.querySelectorAll('.tabs-create .tab-header > div')
    let fieldRequireds = document.querySelectorAll('.tabs-create .tab-content > div .col-required')

    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.remove('active')
      tabHeaders[i].classList.remove('active')
    }

    for (let i = 0; i < fieldRequireds.length; i++) {
      fieldRequireds[i].classList.remove('col-error')
    }
    setErrFieldRequired(false)

    tabContents[0].classList.add('active')
    tabHeaders[0].classList.add('active')
    setPageNumber(1)
  }

  const handleSaveCreateActivate = () => {
    let fieldRequireds = document.querySelectorAll('.tabs-create .tab-content > div .col-required')
    if (pageNumber === 5 && projectsGroupValidate.trim().length === 0 && countryId === 'Es') {

      fieldRequireds[3].classList.add('col-error')
      setErrFieldRequired(true)
    } else if (pageNumber === 5 && codeBDNSValidate.length === 0 && countryId === 'Es') {

      fieldRequireds[4].classList.add('col-error')
      setErrFieldRequired(true)
    }
    else {
      setSaving(true)
      setTitleValidate('')
      setCountryValidate('')
      setAnnuityValidate(0)
      setCodeBDNSValidate([])
      setProjectsGroupValidate('')
      setDisplayValidateContactHat(null)
      setDisplayValidatehat(null)
      setContactHatValidate('')
      setcountryId(null)


      let tabContents = document.querySelectorAll('.tabs-create .tab-content > div')
      let tabHeaders = document.querySelectorAll('.tabs-create .tab-header > div')
      let progressBar = document.querySelectorAll('.tabs-create .tab-header .step .bullet')
      let checkIcon = document.querySelectorAll('.tabs-create .tab-header .step .check')


      for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active')
        tabHeaders[i].classList.remove('active')
      }

      progressBar[pageNumber - 1].classList.add('active')
      checkIcon[pageNumber - 1].classList.add('active')
    }

  }

  //DETECTORES ON CHANGE
  const onTitleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setTitleValidate(e.currentTarget.value)
  }
  const onAnnuityChange = (value: any) => {
    setAnnuityValidate(value)
  }

  const onProjectsgroupChange = (value: any) => {
    setProjectsGroupValidate(value['key'])
  }

  const onCodeBDNSChange = (value: any) => {
    setCodeBDNSValidate(value);
  }

  const onCountryChange = (value: any) => {
    setcountryId(value)
    if (value !== 'Es' && value !== 'Eu') {
      setDisplayValidatehat(null)
      setDisplayValidateContactHat(null)
      setIsCheckHat(false)
    }
    setCountryValidate(value)
    updateFieldInForm(nameof<GrantItem>('locations'), undefined)
  }

  const onContactHatValidate = (e: React.FormEvent<HTMLInputElement>) => {
    setContactHatValidate(e.currentTarget.value)
    setDisplayValidateContactHat(e.currentTarget.value.trim().length === 0 ? true : false)
  }
  //BUTTONS NEXT/BACK
  const nextPage = e => {
    e.preventDefault()

    let fieldRequireds = document.querySelectorAll('.tabs-create .tab-content > div .col-required')

    if (pageNumber === 1 && titleValidate.trim().length === 0) {

      fieldRequireds[0].classList.add('col-error')
      setErrFieldRequired(true)

    } else if (
      (pageNumber === 2 && annuityValidate < 1) ||
      (pageNumber === 2 && countryValidate.trim().length === 0) ||
      (pageNumber === 2 && (countryId === 'Es' || countryId === 'Eu') && (displayValidatehat === null || displayValidatehat)) ||
      (pageNumber === 2 && contactHatValidate.trim().length === 0 && isCheckHat)
    ) {

      if (pageNumber === 2 && annuityValidate < 1) {
        fieldRequireds[1].classList.add('col-error')
        setErrFieldRequired(true)
      }

      if (pageNumber === 2 && countryValidate.trim().length === 0) {
        fieldRequireds[2].classList.add('col-error')
        setErrFieldRequired(true)
      }

      if (pageNumber === 2 && (displayValidatehat === null || displayValidatehat)) {
        setDisplayValidatehat(true)
        setErrFieldRequired(true)
      }

      if (pageNumber === 2 && contactHatValidate.trim().length === 0 && isCheckHat) {
        setDisplayValidateContactHat(true)
        setErrFieldRequired(true)
      }

    } else {

      for (let i = 0; i < fieldRequireds.length; i++) {
        fieldRequireds[i].classList.remove('col-error')
      }
      setErrFieldRequired(false)

      let tabContents = document.querySelectorAll('.tabs-create .tab-content > div')
      let tabHeaders = document.querySelectorAll('.tabs-create .tab-header > div')
      let progressBar = document.querySelectorAll('.tabs-create .tab-header .step .bullet')
      let checkIcon = document.querySelectorAll('.tabs-create .tab-header .step .check')

      for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active')
        tabHeaders[i].classList.remove('active')
      }

      if (pageNumber < 5) {
        tabContents[pageNumber].classList.add('active')
        tabHeaders[pageNumber].classList.add('active')
        progressBar[pageNumber - 1].classList.add('active')
        checkIcon[pageNumber - 1].classList.add('active')
      }
      setPageNumber(pageNumber + 1)
    }
  }

  const backPage = e => {
    e.preventDefault()

    let tabContents = document.querySelectorAll('.tabs-create .tab-content > div')
    let tabHeaders = document.querySelectorAll('.tabs-create .tab-header > div')
    let progressBar = document.querySelectorAll('.tabs-create .tab-header .step .bullet')
    let checkIcon = document.querySelectorAll('.tabs-create .tab-header .step .check')
    let fieldRequireds = document.querySelectorAll('.tabs-create .tab-content > div .col-required')

    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.remove('active')
      tabHeaders[i].classList.remove('active')
    }

    if (pageNumber > 0) {
      progressBar[pageNumber - 2].classList.remove('active')
      checkIcon[pageNumber - 2].classList.remove('active')
      tabContents[pageNumber - 2].classList.add('active')
      tabHeaders[pageNumber - 2].classList.add('active')
    }

    for (let i = 0; i < fieldRequireds.length; i++) {
      fieldRequireds[i].classList.remove('col-error')
    }
    setErrFieldRequired(false)
    setPageNumber(pageNumber - 1)
  }

  useEffect(() => {
    setPageNumber(1)
    setTitleValidate('')
    setCountryValidate('')
    setAnnuityValidate(0)
    setDisplayValidateContactHat(null)
    setDisplayValidatehat(null)
    setContactHatValidate('')
    setIsCheckHat(false)
    setcountryId(null)

    let tabHeaders = document.querySelectorAll('.tabs-create .tab-header > div')
    let tabContents = document.querySelectorAll('.tabs-create .tab-content > div')
    let progressBar = document.querySelectorAll('.tabs-create .tab-header .step .bullet')
    let checkIcon = document.querySelectorAll('.tabs-create .tab-header .step .check')
    let fieldRequireds = document.querySelectorAll('.tabs-create .tab-content > div .col-required')

    for (let i = 0; i < fieldRequireds.length; i++) {
      fieldRequireds[i].classList.remove('col-error')
    }
    setErrFieldRequired(false)

    for (let i = 0; i < tabHeaders.length; i++) {
      tabHeaders[i].classList.remove('active')
      tabContents[i].classList.remove('active')
      progressBar[i].classList.remove('active')
      checkIcon[i].classList.remove('active')
    }
    tabHeaders[0].classList.add('active')
    tabContents[0].classList.add('active')

  }, [reseter])

  const onPeriodChange = (value: Period[]) => {
    setGrantPeriods(value)
  }

  const getCountryCurrencyById = (code: string): string => {
    const country = props.userProfile.countries.filter(a => a.code === code);
    return country[0]?.currency.toString() || '';
  }

  //Convert Budget Format
  const formatterBudget = (value) => {
    if (!value) return '';
    const valueStr = String(value);
    const parts = valueStr.split('.');
    const formattedIntegerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedValue = `${formattedIntegerPart}${parts.length > 1 ? `.${parts[1]}` : ''}`;
    return formattedValue;
  };

  const parserBudget = (value) => {
    if (!value) return '';
    const parsedValue = value.replace(/€|\s|\.+/g, '');
    const processedValue = parsedValue.replace(/,/g, '.');
    return processedValue;
  };

  const arrayBullets = [1, 2, 3, 4, 5]

  return (
    <>
      <div className="create-general">

        <div className="tabs-create">

          <div className="tab-header">
            {arrayBullets.map((bullet) => (
              <div onClick={changeActive} className={bullet === 1 ? "step active" : "step"}>
                <div className="bullet">
                  <span>{bullet}</span>
                </div>
                <div className="check fas fa-check"></div>
              </div>
            ))}
          </div>

          <div className="tab-content">

            <div className="active">
              <p className="title-column">{t('Call Information')}</p>
              {errFieldRequired && <p className="text-error"> {t('Please complete all required fields (*)')} </p>}
              <Row gutter={[16, 12]}>

                <Col span={12} className="col-required" >
                  <label style={{ fontWeight: 'bold' }}>{t('Title')}<span style={{ color: "red" }}> * </span></label>
                  <Form.Item
                    rules={[{ required: true, message: t("The title is required") }]}
                    name={nameof<GrantItem>('title')}>
                    <Input size={'large'} style={{ width: '100%' }} onChange={onTitleChange} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label style={{ fontWeight: 'bold' }}>{t('Url')}</label>
                  <Form.Item name={nameof<GrantItem>('url')}>
                    <Input size={'large'} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <label>{t('Description')}</label>
                  <Form.Item name={nameof<GrantItem>('description')}>
                    <TextArea rows={3} size={'middle'} style={{ width: '100%' }} cols={20} autoSize={{ minRows: 2, maxRows: 3 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Objective')}</label>
                  <Form.Item name={nameof<GrantItem>('scope')}>
                    <TextArea rows={3} size={'middle'} style={{ width: '100%' }} cols={20} autoSize={{ minRows: 2, maxRows: 3 }} maxLength={490} showCount />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <label>{t('Additional Information')}</label>
                  <Form.Item name={nameof<GrantItem>('additionalInformation')}>
                    <TextArea rows={3} size={'middle'} style={{ width: '100%' }} cols={20} autoSize={{ minRows: 2, maxRows: 3 }} maxLength={250} showCount />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={t('Published')} valuePropName={'checked'} name={nameof<GrantItem>('published')}>
                    <Checkbox />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={t('Minimis')} valuePropName={'checked'} name={nameof<GrantItem>('minimis')}>
                    <Checkbox />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div>
              <p className="title-column">{t('General Information')}</p>
              {errFieldRequired && <p className="text-error"> {t('Please complete all required fields (*)')} </p>}
              <Row gutter={[16, 12]}>
                <Col span={12} className="col-required">
                  <label>{t('Annuity')}<span style={{ color: "red" }}> * </span></label>
                  <FormItem
                    rules={[{ required: true, message: t("The Annuity is required") }]}
                    name={nameof<GrantItem>('annuities')}>
                    <AnnuitySelect mode="multiple" labelInValue={false} onChange={(value) => onAnnuityChange(value)} />
                  </FormItem>
                </Col>

                <Col span={12} className="col-required">
                  <label style={{ fontWeight: 'bold' }}>{t('Country')}<span style={{ color: "red" }}> * </span></label>
                  <FormItem
                    rules={[{ required: true, message: t("The Country is required") }]}
                    name={nameof<GrantItem>('countryId')}>
                    <CountrySelect onChange={(value) => onCountryChange(value)} />
                  </FormItem>
                </Col>

                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Region')}</label>
                  <FormItem name={nameof<GrantItem>('locations')}>
                    <LocationSelect fullLoad={fullLoad} countries={[{ value: countryId, label: '' }]} />
                  </FormItem>
                </Col>

                <Col span={(countryId === "Es" || countryId === "Eu") ? 24 : 0}>
                  {(countryId === "Es" || countryId === "Eu") &&
                    <label style={{ fontWeight: 'bold' }}>{t('HAT')}<span style={{ color: "red" }}> * </span></label>}
                  <Form.Item
                    name={nameof<GrantItem>('hat')}
                    hidden={countryId !== "Es" && countryId !== "Eu"}
                  >
                    <Radio.Group
                      onChange={(e: any) => {
                        setDisplayValidatehat(false)
                        setIsCheckHat(e?.target?.value ?? null)
                      }}>
                      <Radio value={true}>{t('Yes')}</Radio>
                      <Radio value={false}>{t('No')}</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <span style={{ color: 'red', display: displayValidatehat ? 'block' : 'none' }}>{t("The hat is required")}</span>
                </Col>

                <Col span={isCheckHat ? 12 : 0}>
                  <label style={{ display: isCheckHat ? 'block' : 'none', fontWeight: 'bold' }}>{t('HatContact')}<span style={{ color: "red" }}> * </span></label>
                  <Form.Item
                    name={nameof<GrantItem>('contactHat')}
                    hidden={!isCheckHat}
                  >
                    <Input size={'large'} style={{ width: '100%' }} onChange={onContactHatValidate} />
                  </Form.Item>
                  <span style={{ color: 'red', display: displayValidateContactHat ? 'block' : 'none' }}>{t("The contact hat is required")}</span>
                </Col>

                <Col span={isCheckHat ? 12 : 0}>
                  <label style={{ display: isCheckHat ? 'block' : 'none' }}>{t('HatContact2')}<span style={{ color: "red" }}></span></label>
                  <Form.Item
                    name={nameof<GrantItem>('contactHat2')}
                    hidden={!isCheckHat}
                  >
                    <Input size={'large'} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={isCheckHat ? 12 : 0} >
                  <label style={{ display: isCheckHat ? 'block' : 'none' }}>{t('Mirror 1')}</label>
                  <Form.Item
                    name={nameof<GrantItem>('mirror1')}
                    hidden={!isCheckHat}
                  >
                    <Input size={'large'} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={isCheckHat ? 12 : 0} >
                  <label style={{ display: isCheckHat ? 'block' : 'none' }}>{t('Mirror 2')}</label>
                  <Form.Item
                    name={nameof<GrantItem>('mirror2')}
                    hidden={!isCheckHat}
                  >
                    <Input size={'large'} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={isCheckHat ? 12 : 0} >
                  <label style={{ display: isCheckHat ? 'block' : 'none' }}>{t('Mirror 3')}</label>
                  <Form.Item
                    name={nameof<GrantItem>('mirror3')}
                    hidden={!isCheckHat}
                  >
                    <Input size={'large'} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={isCheckHat ? 12 : 0} >
                  <label style={{ display: isCheckHat ? 'block' : 'none' }}>{t('Mirror 4')}</label>
                  <Form.Item
                    name={nameof<GrantItem>('mirror4')}
                    hidden={!isCheckHat}
                  >
                    <Input size={'large'} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Typology of project')}</label>
                  <FormItem name={nameof<GrantItem>('typologies')}>
                    <TypologySelect mode={"multiple"} />
                  </FormItem>
                </Col>

                <Col span={24}>
                  <label>{t('Sectors')}</label>
                  <FormItem name={nameof<GrantItem>('sectors')}>
                    <SectorAllSelect mode={"multiple"} />
                  </FormItem>
                </Col>

                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Target Sectors')}</label>
                  <FormItem name={nameof<GrantItem>('targetSectors')}>
                    <TargetSectorAllSelect mode={"multiple"} />
                  </FormItem>
                </Col>

                <Col span={12}>
                  <label style={{ fontWeight: 'bold' }}>{t('Category')}</label>
                  <Form.Item name={nameof<GrantItem>('category')}>
                    <Select size={'middle'} style={{ width: '100%' }} placeholder={t("Select a Category")}>
                      <Select.Option key={'A'} value={0}>
                        {t('A')}
                      </Select.Option>
                      <Select.Option key={'B'} value={1}>
                        {t('B')}
                      </Select.Option>
                      <Select.Option key={'C'} value={2}>
                        {t('C')}
                      </Select.Option>
                      <Select.Option key={'D'} value={3}>
                        {t('D')}
                      </Select.Option>
                      <Select.Option key={'E'} value={4}>
                        {t('E')}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label>{t('Source of the founds')}</label>
                  <Form.Item name={nameof<GrantItem>('source')}>
                    <Select size={'middle'} style={{ width: '100%' }} placeholder={t("Select a Source")}>
                      <Select.Option key={'Public'} value={2}>
                        {t('Public')}
                      </Select.Option>
                      <Select.Option key={'Private'} value={1}>
                        {t('Private')}
                      </Select.Option>
                      <Select.Option key={'UnUnknown'} value={0}>
                        {t('Unknown')}
                      </Select.Option>
                      <Select.Option key={'Both'} value={SourceType.Both}>
                        {t('Both')}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

              </Row>
            </div>

            <div>
              <p className="title-column">{t('Beneficiary Information')}</p>
              <Row gutter={[16, 12]}>
                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Beneficiary Type')}</label>
                  <FormItem name={nameof<GrantItem>('beneficiaryTypes')}>
                    <BeneficiaryTypeSelect mode={"multiple"} />
                  </FormItem>
                </Col>

                <Col span={12}>
                  <label>{t('Beneficiary nature')}</label>
                  <Form.Item name={nameof<GrantItem>('beneficiarySource')}>

                    <Select size={'middle'} style={{ width: '100%' }} placeholder={t("Select a Beneficiary Source")}>
                      <Select.Option key={'Public'} value={2}>
                        {t('Public')}
                      </Select.Option>
                      <Select.Option key={'Private'} value={1}>
                        {t('Private')}
                      </Select.Option>
                      <Select.Option key={'UnUnknown'} value={0}>
                        {t('Unknown')}
                      </Select.Option>
                      <Select.Option key={'Both'} value={SourceType.Both}>
                        {t('Both')}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label style={{ fontWeight: 'bold' }}>{t('Official Source')}</label>
                  <Form.Item name={nameof<GrantItem>('oficialSource')}>
                    <Select size={'middle'} style={{ width: '100%' }} placeholder={t("Select an Official Source")}>
                      {
                        officialSourceEnum.map(x => (
                          <Select.Option key={x.title} value={x.title}>
                            {t(x.title)}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label>{t('Status')}</label>
                  <Form.Item name={nameof<GrantItem>('status')}>
                    <Select size={'middle'} style={{ width: '100%' }} placeholder={t("Select a Status")}>
                      {
                        options.map(x => (
                          <Select.Option key={x} value={x}>
                            {t(x)}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label>{t('Organism')}</label>
                  <Space.Compact size="middle" className='organism-inputs'>
                    <Form.Item name={nameof<GrantItem>('organism')}>
                      <Input size={'middle'} placeholder={t("Organism Value")} />
                    </Form.Item>
                    <Form.Item name={nameof<GrantItem>('organismUrl')}>
                      <Input prefix={<LinkOutlined />} size={'middle'} placeholder={t("Organism Url")} />
                    </Form.Item>
                  </Space.Compact>
                </Col>

                <Col span={24}>
                  <label>{t('Modality of Participation')}</label>
                  <Form.Item name={nameof<GrantItem>('modalityParticipation')}>
                    <Select
                      size={'middle'}
                      style={{ width: '100%' }}
                      placeholder={t("Select a Modality of Participation")}>

                      <Select.Option value={'Individual'}>
                        {t('Individual')}
                      </Select.Option>
                      <Select.Option value={'Consorciada'}>
                        {t('Collaborative')}
                      </Select.Option>
                      <Select.Option value={'Individual y Consorciada'}>
                        {t('Individual and Collaborative')}
                      </Select.Option>

                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Financing Modality')}</label>
                  <Form.Item name={nameof<GrantItem>('financingModalityValue')}>
                    <Select
                      size={'middle'}
                      style={{ width: '100%' }}
                      placeholder={t("Select a Financing Modality")}
                      mode='multiple'
                    >
                      {financingModalityEnum.map(x => (
                        <Select.Option key={x.title} value={x.title}>
                          {t(x.title)}
                        </Select.Option>
                      ))}

                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div>
              <p className="title-column">{t('Call Dates')}</p>
              <Row>
                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Publication Date')}</label>
                  <Form.Item name={nameof<GrantItem>('publicationDate')}>
                    <DatePicker
                      defaultValue={moment()}
                      style={{ width: '100%' }}
                      getPopupContainer={(triggerNode) => {
                        return triggerNode.parentNode as HTMLElement
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={24} id='periods' style={{ padding: '0 15px' }}>
                  <Form.Item name={nameof<GrantItem>('periods')}>
                    <DatePeriods value={grant?.periods} onChange={(periods) => onPeriodChange(periods)} />
                  </Form.Item>
                </Col>

                <Col span={24} style={{ marginTop: '30px' }}>
                  <label style={{ fontWeight: 'bold' }}>{t('Closing Date (Description)')}</label>
                  <Form.Item name={nameof<GrantItem>('deadlineString')}>
                    <TextArea rows={1} size={'middle'} style={{ width: '100%' }} cols={20} autoSize={{ minRows: 1, maxRows: 5 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div>
              {errFieldRequired && <p className="text-error"> {t('Please complete all required fields (*)')} </p>}
              <p className="title-column">{t('Call and Project Budget')}</p>
              <Row gutter={[16, 12]}>

                <Col span={12}>
                  <label style={{ fontWeight: 'bold' }}>{t('Total Budget')}</label>
                  <Form.Item name={nameof<GrantItem>('totalBudget')}>
                    <InputNumber
                      addonAfter={<strong>{t(getCountryCurrencyById(countryId))} </strong>}
                      formatter={(value) => formatterBudget(value)}
                      parser={parserBudget} min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label>{t('Grant Budget')}</label>
                  <Form.Item name={nameof<GrantItem>('grantBudget')}>
                    <InputNumber
                      addonAfter={<strong>{t(getCountryCurrencyById(countryId))} </strong>}
                      formatter={(value) => formatterBudget(value)}
                      parser={parserBudget} min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>


                <Col span={12}>
                  <label>{t('Min Budget')}</label>
                  <Form.Item name={nameof<GrantItem>('minBudget')}>
                    <InputNumber
                      addonAfter={<strong>{t(getCountryCurrencyById(countryId))} </strong>}
                      formatter={(value) => formatterBudget(value)}
                      parser={parserBudget} min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <label>{t('Max Budget')}</label>
                  <Form.Item name={nameof<GrantItem>('maxBudget')}>
                    <InputNumber
                      addonAfter={<strong>{t(getCountryCurrencyById(countryId))} </strong>}
                      formatter={(value) => formatterBudget(value)}
                      parser={parserBudget} min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                {(isAdmin || isRealAdmin) && (
                  <Col span={8}>
                    <label>{t('FI Success Rate')}</label>
                    <Form.Item name={nameof<GrantItem>('fiSuccessRate')}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        formatter={value => !!value ? `${value}%` : ``} />
                    </Form.Item>
                  </Col>
                )}

                {(isAdmin || isRealAdmin) && (
                  <Col span={8}>
                    <label>{t('Success Rate')}</label>
                    <Form.Item name={nameof<GrantItem>('successRate')}>
                      <Input size={'middle'} style={{ borderColor: 'none !important' }} />
                    </Form.Item>
                  </Col>
                )}

                {(isAdmin || isRealAdmin) && countryId === "Es" ? (
                  <Col span={8} className="col-required">
                    <label>{t('Projects Group')}<span style={{ color: "red" }}> * </span></label>
                    <Form.Item
                      rules={[{ required: true, message: t("The Projects is required") }]}
                      name={nameof<GrantItem>('projectGroup')}>
                      <ProjectGroupSelect
                        countryId={countryId}
                        onChange={(value) => onProjectsgroupChange(value)} />
                    </Form.Item>
                  </Col>
                ) : ((isAdmin || isRealAdmin) &&
                  <Col span={8}>
                    <label style={{ fontWeight: 'bold' }}>{t('Projects Group')}</label>
                    <Form.Item name={nameof<GrantItem>('projectGroup')}>
                      <ProjectGroupSelect countryId={countryId}
                        onChange={(value) => onProjectsgroupChange(value)} />
                    </Form.Item>
                  </Col>
                )
                }

                {(isAdmin || isRealAdmin) && (
                  <Col span={countryId === "Es" ? 24 : 0} className="col-required">
                    {countryId === "Es" &&
                      <label style={{ fontWeight: 'bold' }}>{t('Code BDNS')}<span style={{ color: "red" }}> * </span></label>}
                    <Form.Item
                      rules={[{ required: countryId === "Es", message: t("The code is required") }]}
                      name={nameof<GrantItem>('codesBDNS')}
                      hidden={countryId !== "Es"}
                    >
                      <Select
                        mode="tags"
                        onChange={(value) => onCodeBDNSChange(value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                )
                }

                {(isAdmin || isRealAdmin) && (
                  <Col span={24}>
                    <label>{t('Public Body Contact Phone')}</label>
                    <Form.Item name={nameof<GrantItem>('publicBodyContactPhone')}>
                      <Input size={'middle'} style={{ borderColor: 'none !important' }} />
                    </Form.Item>
                  </Col>
                )}

                {(isAdmin || isRealAdmin) && (
                  <Col span={24}>
                    <label>{t('Public Body Contact Email')}</label>
                    <Form.Item name={nameof<GrantItem>('publicBodyContactEmail')}>
                      <Input size={'middle'} style={{ borderColor: 'none !important' }} />
                    </Form.Item>
                  </Col>
                )}

                <Col span={24}>
                  <label style={{ fontWeight: 'bold' }}>{t('Aid Intensity')}</label>
                  <Form.Item name={nameof<GrantItem>('aidIntensity')}>
                    <TextArea rows={1} size={'middle'} style={{ width: '100%' }} cols={20} autoSize={{ minRows: 1, maxRows: 5 }} />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={t('Warranties')} valuePropName={'checked'} name={nameof<GrantItem>('warranties')}>
                    <Checkbox />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={t('Advance')} valuePropName={'checked'} name={nameof<GrantItem>('advance')}>
                    <Checkbox />
                  </Form.Item>
                </Col>
              </Row>

            </div>

          </div>

        </div>


        {/*STEPPER CONTROLLER*/}
        <div className="stepper-controller">

          {pageNumber == 1 &&
            <Button key="back" onClick={handleCancelCreateActivate}>
              {t('Cancel')}
            </Button>
          }

          {pageNumber > 1 &&
            <Button onClick={backPage}> {t('Back')} </Button>
          }

          {pageNumber < 5 &&
            <Button onClick={nextPage}> {t('Next')} </Button>
          }

          {pageNumber == 5 &&
            <Button key="submit" type="primary" loading={loading} onClick={handleSaveCreateActivate}>
              {t('Create')}
            </Button>
          }
        </div>

      </div >

    </>

  )
}

export default withUserProfile(withTranslation()(GrantEdit))
