import { Alert, Spin, Radio, Input, Card, Row, Col, Button, Select } from 'antd'
import Form from 'antd/lib/form'
import Modal from 'antd/lib/modal/Modal'
import React, { FC, useEffect, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { CommandResult } from 'src/core/stores/types'
import { container } from 'src/inversify.config'
import AnnuitySelect from 'src/components/annuity-select'
import CountrySelect from 'src/components/country-select'
import LocationSelect from 'src/components/location-select'
import SectorSelect from 'src/components/sector-select'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import {
  CreateNotificationSubscriptionItem,
  NotificationSubscriptionItem,
  NotificationFrequencyToString,
  NotificationSubscriptionItemFormStore,
  ParseNotificationFrequency,
} from 'src/stores/notification-store'
import { nameof } from '../../core/utils/object'
import DaysSelectorEditor from 'src/components/daysSelectionEditor'
import TimezoneSelect from 'react-timezone-select'
import { CacheProps, withCache } from '../../core/services/cache.service'
import { DeleteOutlined } from '@ant-design/icons'
import TypologySelect from '../../components/typology-select'
import { Category } from '../../stores/grant-store'

const { Option } = Select

interface Props extends WithTranslation, CacheProps {
  formTitle: string
  // operation: 'create' | 'update';
  notificationSubscriptionId?: string
  onClose: (response?: CommandResult<CreateNotificationSubscriptionItem>) => void
  loadFromStore?: boolean,
  adminPage: false | boolean,
}

export interface NotificationSubscritionFormData {
  title: string
  frequency: string
  days: string
  country?: string
  locations?: any[]
  sectors?: any[]
  beneficiaryTypes?: any[]
  annuity: string,
  annuities: any[],
  typologies?: any[],
  categories?: any[]
  /*subscriptionsType: number*/
}

const NotificationSubscritionUpsertionModal: FC<Props> = (props) => {
  const { t, formTitle, onClose, notificationSubscriptionId, loadFromStore, cache, adminPage } = props

  const [form] = Form.useForm<CreateNotificationSubscriptionItem>()
  const [initialValues, setInitialValues] = useState<NotificationSubscritionFormData>({ frequency: 'Daily' } as NotificationSubscritionFormData)
  const [timeZone, setTimeZone] = useState({
    value: 'Europe/Brussels',
    label: '(GMT+2:00) Brussels, Copenhagen, Madrid, Paris',
    offset: 2,
    abbrev: 'CEST',
    altName: 'Central European Summer Time',
  })
  const [fullLoad, setFullLoad] = useState(false)
  const currentStore = container.get(NotificationSubscriptionItemFormStore)
  const currentState = currentStore.state
  const [isBusy, setIsBusy] = useState(true)
  const [frequency, setFrequency] = useState('Daily')
  const [country, setCountry] = useState<string>()
  const [errorCreate, setErrorCreate] = useState('')
  /*const [subscriptionsType, setSubscriptionsType] = useState<number>() */

  useEffect(() => {
    if (notificationSubscriptionId) {
      load(notificationSubscriptionId)
    } else {
      if (loadFromStore) {
        const storedFilter = cache.getWithCustomKey('grants-filter', true)
        if (storedFilter) {
          var initialCurrent = {
            annuity: storedFilter.annuityId,
            annuities: storedFilter.annuities,
            title: '',
            frequency: 'Weekly',
            country: storedFilter.countryId,
            locations: storedFilter.locations,
            sectors: storedFilter.sectors,
            typologies: storedFilter.typologies,
            categories: storedFilter.categories,
            beneficiaryTypes: storedFilter.bftypes,
          } as NotificationSubscritionFormData
          setFrequency(initialCurrent.frequency)
          setCountry(initialCurrent.country)
          setInitialValues(initialCurrent)
        }
      }
      setIsBusy(false)
    }
  }, [notificationSubscriptionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async (id: string) => {
    await currentStore.load(id, adminPage ? 1 : 0)

    var initialCurrent = {
      //annuity: currentState.item.value.query?.annuity,
      annuities: currentState.item.value.query.annuities?.map((x: any) => ({ value: x })),
      title: currentState.item.value.title,
      frequency: currentState.item.value.frequency,
      country: currentState.item.value.query?.countryCode,
      locations: currentState.item.value.query.locations?.map((x: any) => ({ value: x })),
      days: currentState.item.value.days,
      typologies: currentState.item.value.query?.typologies?.map((x: any) => ({ value: x })),
      categories: currentState.item.value.query?.categories?.map((x: any) => ({ value: x })),
      sectors: currentState.item.value.query?.sectors?.map((x: any) => ({ value: x })),
      beneficiaryTypes: currentState.item.value.query?.beneficiaryTypes?.map((x: any) => ({ value: x })),
      /*subscriptionsType: currentState.item.value.subscriptionsType,*/
    } as NotificationSubscritionFormData
    setFrequency(initialCurrent.frequency)
    setCountry(initialCurrent.country)
    setTimeZone(currentState.item.value.userTimeZone)
    setInitialValues(initialCurrent)
    /*setSubscriptionsType(initialCurrent.subscriptionsType)*/
    setIsBusy(false)
  }

  const onSaveItem = async () => {
    setIsBusy(true)
    let item: NotificationSubscritionFormData

    try {
      item = (await form.validateFields()) as any as NotificationSubscritionFormData
    } catch {
      return
    }
    const postData: CreateNotificationSubscriptionItem = {
      title: item.title,
      frequency: ParseNotificationFrequency(item.frequency),
      query: {
        //annuity: item.annuity,
        annuities: item.annuities?.map((x: any) => x.value),
        beneficiaryTypes: item.beneficiaryTypes?.map((x: any) => x.value),
        countryCode: item.country,
        locations: item.locations?.map((x: any) => x.value),
        sectors: item.sectors?.map((x: any) => x.value),
        typologies: item.typologies?.map((x: any) => x.value),
        categories: item.categories?.map((x: any) => x.value),
      },
      days: item.days,
      userTimeZone: timeZone,
      /*subscriptionsType: item.subscriptionsType,*/
    }
    if (postData.frequency == 0) {
      postData.days = ""
    }
    if (notificationSubscriptionId) {
      const response = await currentStore.save(notificationSubscriptionId, postData as any)
      if (response) {
        setErrorCreate('')
        form.resetFields()
        onClose()
        setIsBusy(false)
      }
    } else {
      const response = await currentStore.create(postData)
      if (response) {
        form.resetFields()
        onClose()
        setIsBusy(false)
      }
    }

  }

  const renderForm = () => {
    if (currentState.isBusy?.value || isBusy) {
      return <Spin spinning={true} />
    }
    return (
      <>
        {currentState.errorMessage.get() && (<Alert type="error" message={t(currentState.errorMessage.value || '')} />)}
        <Spin spinning={currentState.isBusy.get()}>
          <Form initialValues={initialValues} size="small" form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                {/*<Form.Item*/}
                {/*  className={'subscription-item-form'}*/}
                {/*  label={t('Type')}*/}
                {/*  name={nameof<NotificationSubscritionFormData>('subscriptionsType')}*/}
                {/*>*/}
                {/*  <Select*/}
                {/*    placeholder={t('Select type of subscription')}*/}
                {/*    style={{ width: '100%', minWidth: '0px' }}*/}
                {/*    value={subscriptionsType}*/}
                {/*  >*/}
                {/*    <Option key={'New'} value={0} >*/}
                {/*      {t('New subscriptions')}*/}
                {/*    </Option>*/}
                {/*    <Option key={'File'} value={1}>*/}
                {/*      {t('Subscriptions with changed files')}*/}
                {/*    </Option>*/}
                {/*  </Select>*/}
                {/*</Form.Item>*/}
                <Form.Item
                  className={'subscription-item-form'}
                  label={t('Title')}
                  name={nameof<NotificationSubscritionFormData>('title')}
                  rules={[{ required: true, message: t('The title is required') }]}
                >
                  <Input placeholder={t('Select Title for Subscription')} />
                </Form.Item>
                <Form.Item className={'subscription-item-form'} label={t('Frequency')} name={nameof<NotificationSubscritionFormData>('frequency')}>
                  <Radio.Group
                    onChange={(e: any) => {
                      var current = initialValues
                      current.frequency = e?.target?.value ?? 'Daily'
                      setFrequency(e?.target?.value ?? 'Daily')
                      setInitialValues(current)
                    }}
                  >
                    <Radio value={'Snapshots'}>{t('Snapshots')}</Radio>
                    <Radio value={'Daily'}>{t('Daily')}</Radio>
                    <Radio value={'Weekly'}>{t('Weekly')}</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item className={'subscription-item-form'} name={nameof<NotificationSubscritionFormData>('days')}>
                  <DaysSelectorEditor frequency={frequency as any} disabled={frequency !== 'Weekly'} days={initialValues.days}></DaysSelectorEditor>
                </Form.Item>

                <Form.Item label={t('User Time Zone')} className={'subscription-item-form'}>
                  <TimezoneSelect value={timeZone} onChange={(value) => setTimeZone(value as any)} />
                </Form.Item>

                {adminPage &&
                  <>
                    <Form.Item label={t('Created by')} className={'subscription-item-form'}>
                      <span>{currentState.value.item.createdByDisplayName}</span>
                    </Form.Item>

                    <Form.Item label={t('Modified by')} className={'subscription-item-form'}>
                      <span>{currentState.value.item.modifiedByDisplayName}</span>
                    </Form.Item>
                  </>}

                {notificationSubscriptionId && !adminPage && (
                  <Form.Item style={{ textAlign: 'center', marginTop: 80 }} className={'subscription-item-form'}>
                    <Button
                      onClick={async () => {
                        await currentStore.Delete(notificationSubscriptionId)
                        onClose()
                      }}
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      {t('Cancel Subscription')}
                    </Button>
                  </Form.Item>
                )}
              </Col>
              <Col span={12}>
                <Card className={'filter-avatar'} title={t('Filters')}>
                  <Form.Item label={t('Annuity')} name={nameof<NotificationSubscritionFormData>('annuities')}>
                    <AnnuitySelect placeholder={t('All')} labelInValue={true} mode={'multiple'} />
                  </Form.Item>
                  <Form.Item label={t('Country')} name={nameof<NotificationSubscritionFormData>('country')}>
                    <CountrySelect nullable onChange={(value) => setCountry(value)} placeholder={t('All')} />
                  </Form.Item>
                  <Form.Item label={t('Locations')} name={nameof<NotificationSubscritionFormData>('locations')}>
                    <LocationSelect
                      fullLoad={fullLoad} placeholder={t('All')}
                      countries={[{ value: country, label: '' }]}
                    />
                  </Form.Item>

                  <Form.Item label={t('Category')} name={nameof<NotificationSubscritionFormData>('categories')}>
                    <Select
                      //value={filter.category}
                      placeholder={t('Any...')}
                      dropdownMatchSelectWidth
                      allowClear
                      style={{ width: '100%' }}
                      labelInValue
                      mode={"multiple"}>
                      <Option key={'A'} value={1}>{t('Very important call')}</Option>
                      <Option key={'B'} value={2}>{t('Important call')}</Option>
                      <Option key={'C'} value={3}>{t('Reactive call')}</Option>
                      <Option key={'D'} value={4}>{t('Call not for companies')}</Option>
                      <Option key={'E'} value={5}>{t("FI doesn't work this call")}</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label={t('Typologies')} name={nameof<NotificationSubscritionFormData>('typologies')}>
                    <TypologySelect mode={'multiple'} placeholder={t('All')} />
                  </Form.Item>
                  <Form.Item label={t('Sectors')} name={nameof<NotificationSubscritionFormData>('sectors')}>
                    <SectorSelect mode={'multiple'} placeholder={t('All')} />
                  </Form.Item>
                  <Form.Item label={t('Beneficiary Types')} name={nameof<NotificationSubscritionFormData>('beneficiaryTypes')}>
                    <BeneficiaryTypeSelect mode={'multiple'} placeholder={t('All')} />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Form>
        </Spin>
      </>
    )
  }

  return (
    <Modal
      width={1000}
      maskClosable={true}
      title={formTitle}
      centered
      visible={true}
      onOk={onSaveItem}
      onCancel={() => onClose()}
      okText={t('OK')}
      cancelText={t('Cancel')}
      okButtonProps={{ disabled: isBusy }}
    >
      {renderForm()}
    </Modal>
  )
}

export default withCache(withTranslation()(NotificationSubscritionUpsertionModal))
