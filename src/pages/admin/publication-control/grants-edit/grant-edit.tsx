import { withTranslation, WithTranslation } from 'react-i18next'
import { GrantItem, SourceType, GrantStatus, FileTypeGrantSummaryStore } from '../../../../stores/grant-store'
import React, { FC, useEffect, useState } from 'react'

import { Card, Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Radio } from 'antd'
import { nameof } from '../../../../core/utils/object'
import FormItem from 'antd/lib/form/FormItem'
import TextArea from 'antd/es/input/TextArea'
import FileAttachmentsSelectorView from '../../../../components/file-attachments'
import { IdentityProps } from '../../../../core/services/authentication'
import LocationSelect from 'src/components/location-select'
import SectorAllSelect from 'src/components/sector-AllSelect'
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select'
import TypologySelect from 'src/components/typology-select'
import CountrySelect from 'src/components/country-select'
import AnnuitySelect from 'src/components/annuity-select'
import './grant-edit-style.less'
import { enumSelector } from 'src/utils/enums/enumSelector'
import { OfficialSourceEnum } from 'src/utils/enums/officialSource.enum'
import { UserProfileProps, withUserProfile } from '../../../../components/user-profile'
import DatePeriods from 'src/components/periods/datePeriods'
import { FinancingModalityEnum } from 'src/utils/enums/financingModality.enum'
import TargetSectorAllSelect from '../../../../components/targetSector-AllSelect'
import { LinkOutlined } from '@ant-design/icons'
import ProjectGroupSelect from '../../../../components/projectGroup-select'
import { container } from 'src/inversify.config';
import FileGeneralDetail from 'src/pages/grants/file-general';
import { getFileTypes } from '../../../../utils/docTypes'

interface GrantEditProps extends WithTranslation, IdentityProps, UserProfileProps {
    url: string
    grant: GrantItem
    onChangePeriod?: (periods: Period[]) => void
    periodFlag: boolean
    onChangeModify: any
    updateFieldInForm: (name: any, value: any) => void;
}

export interface Period {
    id?: number
    openningDate: Date
    closingDate: Date
}

const GrantEdit: FC<GrantEditProps> = (props) => {
    const { t, grant, identity, onChangeModify, updateFieldInForm } = props

    const isAdmin =
        (props.identity.roles ? props.identity.roles : []).filter(
            (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
        )?.length > 0

    const officialSourceEnum = enumSelector(OfficialSourceEnum)

    const currentFileTypeStore = container.get(FileTypeGrantSummaryStore);
    const currentFileTypeState = currentFileTypeStore.state;

    const loadFilesTypes = async () => {
        if (grant?.id) await currentFileTypeStore.getAll(Number(grant.id))
    }

    const fileTypes = getFileTypes(t, false);

    const fileRegulationsTypes = ['Call', 'RegulatoryBase', 'Modification', 'Resolution'];
    const fileToolsTypes = ['Summary', 'Presentation', 'Justification', 'Request', 'Faqs', 'Other'];

    const options = [GrantStatus.Open, GrantStatus.Closed, GrantStatus.PendingPublication]
    const [countryId, setcountryId] = useState(null)
    const dateFormat = 'YYYY/MM/DD'
    const [reloadFileList, setReloadFileList] = useState(false);

    const financingModality = enumSelector(FinancingModalityEnum);

    const [isCheckHat, setIsCheckHat] = useState(grant.hat)
    const [countryIdValidateId, setCountryIdValidateId] = useState(grant.countryId)

    useEffect(() => {
        setCountryIdValidateId(grant.countryId)
        setcountryId(grant.countryId)
        setIsCheckHat(grant.hat)
        loadFilesTypes();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setCountryIdValidateId(grant.countryId)
        setcountryId(grant.countryId)
        setIsCheckHat(grant.hat)
        loadFilesTypes();
    }, [grant, reloadFileList]) // eslint-disable-line react-hooks/exhaustive-deps

    const grantHasResume = () => {
        return grant.files?.any((file) => ['Resumen', 'Start w konkursie', 'Resume', 'Summary'].includes(file.documentType))
    }

    const onSectorChanges = (value: any) => {
        grant.sectors = value.map((x: any) => ({ id: x.value, name: x.label }))
    }

    const onTargetSectorChanges = (value: any) => {
        grant.targetSectors = value.map((x: any) => ({ id: x.value, name: x.label }))
    }

    const onTypologiesChanges = (value: any) => {
        grant.typologies = value.map((x: any) => ({ id: x.value, name: x.label }))
    }

    const getCountryCurrencyById = (code: string): string => {
        const country = props.userProfile.countries.filter(a => a.code === code);
        return country[0]?.currency.toString() || '';
    }

    const onCountryChange = (value: any) => {
        setcountryId(value)
        setCountryIdValidateId(value)
        if (value !== 'Es' && value !== 'Eu') {
            setIsCheckHat(false)
        }
        updateFieldInForm(nameof<GrantItem>('locationsShow'), undefined)
    }

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

    const allowedFileKeysAccess = fileTypes.map(fileType => fileType.key)
    const finalAllowedFileKeys = currentFileTypeState.items.get().map(type => {
        const matchingFileType = fileTypes.find(fileType => fileType.documentTypes.includes(type));
        return matchingFileType !== undefined && allowedFileKeysAccess.includes(matchingFileType.key) ? matchingFileType.key : 'Other';
    });

    const finalAllowedFileRegulationsKeys = finalAllowedFileKeys.filter(type => fileRegulationsTypes.includes(type));
    const finalAllowedFileToolsKeys = finalAllowedFileKeys.filter(type => fileToolsTypes.includes(type));

    return (
        <>
            {grant && (
                <>
                    {grant.countryId && (
                        <>
                            <FormItem label={t('Id')} name={nameof<GrantItem>('id')} hidden>
                                <Input size={'middle'} hidden disabled />
                            </FormItem>

                            <FormItem label={t('Typologies')} name={nameof<GrantItem>('typologies')} hidden>
                                <Input size={'middle'} hidden disabled />
                            </FormItem>
                            <FormItem label={t('Sectors')} name={nameof<GrantItem>('sectors')} hidden>
                                <Input size={'middle'} hidden disabled />
                            </FormItem>

                            <div className="general-container">
                                {/* GENERAL INFO */}
                                <div className="box-container">

                                    <p className="title-edit">{t('Call Information')} <i className="fa-solid fa-earth-americas"></i></p>

                                    <Row className='edit-container'>

                                        <Col span={24}>
                                            <span style={{ fontSize: 18 }}> ID: <a href={`${process.env.PUBLIC_URL}/search/${grant.id}`} target="_blank">{grant.id}</a></span>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-globe"></i> {t('Title')}</label>
                                            <FormItem
                                                rules={[{ required: true, message: t("The title is required") }]}
                                                name={nameof<GrantItem>('title')}>
                                                <Input size={'large'} onChange={() => onChangeModify('modifyTitle')} />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label><i className="fa-solid fa-link"></i> {t('Url')} </label>
                                            <Form.Item
                                                name={nameof<GrantItem>('url')}>
                                                <Input size={'middle'} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label><i className="fa-solid fa-flag"></i> {t('Country')}</label>
                                            <FormItem
                                                rules={[{ required: true, message: t("The Country is required") }]}
                                                name={nameof<GrantItem>('countryId')}>
                                                <CountrySelect value={grant.countryId} onChange={(value) => onCountryChange(value)} />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label><i className="fa-solid fa-calendar-days"></i> {t('Annuities')}</label>
                                            <FormItem
                                                rules={[{ required: true, message: t("Annuity is required") }]}
                                                name={nameof<GrantItem>('annuities')}>
                                                <AnnuitySelect mode="multiple" />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label><i className="fa-solid fa-bookmark"></i> {t('Category')}</label>
                                            <Form.Item name={nameof<GrantItem>('category')} style={{ width: '100%' }}>
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
                                            <label><i className="fa-solid fa-face-smile"></i> {t('Status')}</label>
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

                                        <Col span={24}>
                                            <label> <i className="fa-solid fa-circle-info"></i> {t('Description')}</label>
                                            <Form.Item
                                                name={nameof<GrantItem>('description')}>
                                                <TextArea rows={3} size={'middle'} cols={20} autoSize={{ minRows: 3, maxRows: 5 }} onChange={() => onChangeModify('modifyDescription')} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24}>
                                            <label><i className="fa-solid fa-list"></i> {t('Objective')} </label>
                                            <Form.Item
                                                name={nameof<GrantItem>('scope')}>
                                                <Input size={'middle'} maxLength={490} showCount onChange={() => onChangeModify('modifyScope')} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24}>
                                            <label><i className="fa-solid fa-list"></i> {t('Additional Information')} </label>
                                            <Form.Item
                                                name={nameof<GrantItem>('additionalInformation')}>
                                                <Input size={'middle'} maxLength={250} showCount onChange={() => onChangeModify('modifyAdditionalInformation')} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={(countryIdValidateId === "Es" || countryIdValidateId === "Eu") ? 24 : 0}>
                                            {(countryIdValidateId === "Es" || countryId === "Eu") &&
                                                <label><i className="fa-solid fa-user-group"></i> {t('HAT')}</label>}
                                            <Form.Item
                                                name={nameof<GrantItem>('hat')}
                                                hidden={countryIdValidateId !== 'Es' && countryIdValidateId !== 'Eu'}>
                                                <Radio.Group
                                                    onChange={(e: any) => {
                                                        setIsCheckHat(e?.target?.value ?? null)
                                                    }}
                                                >
                                                    <Radio value={true}>{t('Yes')}</Radio>
                                                    <Radio value={false}>{t('No')}</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </Col>

                                        <Col span={isCheckHat ? 24 : 0}>
                                            <label style={{ display: isCheckHat ? 'block' : 'none' }}> <i className="fa-solid fa-user-group"></i> {t('HatContact')}</label>
                                            <FormItem
                                                rules={[{ required: isCheckHat, whitespace: true, message: t("The contact hat is required") }]}
                                                name={nameof<GrantItem>('contactHat')}
                                                hidden={!isCheckHat}
                                            >
                                                <Input size={'large'} />
                                            </FormItem>
                                        </Col>

                                        <Col span={isCheckHat ? 24 : 0}>
                                            <label style={{ display: isCheckHat ? 'block' : 'none' }}> <i className="fa-solid fa-user-group"></i> {t('HatContact2')}</label>
                                            <FormItem
                                                name={nameof<GrantItem>('contactHat2')}
                                                hidden={!isCheckHat}
                                            >
                                                <Input size={'large'} />
                                            </FormItem>
                                        </Col>

                                        <Col span={isCheckHat ? 24 : 0}>
                                            <label style={{ display: isCheckHat ? 'block' : 'none' }}><i className="fa-solid fa-list"></i> {t('Mirror 1')} </label>
                                            <Form.Item
                                                hidden={!isCheckHat}
                                                name={nameof<GrantItem>('mirror1')}>
                                                <Input size={'middle'} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={isCheckHat ? 24 : 0}>
                                            <label style={{ display: isCheckHat ? 'block' : 'none' }}><i className="fa-solid fa-list"></i> {t('Mirror 2')} </label>
                                            <Form.Item
                                                hidden={!isCheckHat}
                                                name={nameof<GrantItem>('mirror2')}>
                                                <Input size={'middle'} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={isCheckHat ? 24 : 0}>
                                            <label style={{ display: isCheckHat ? 'block' : 'none' }}><i className="fa-solid fa-list"></i> {t('Mirror 3')} </label>
                                            <Form.Item
                                                hidden={!isCheckHat}
                                                name={nameof<GrantItem>('mirror3')}>
                                                <Input size={'middle'} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={isCheckHat ? 24 : 0}>
                                            <label style={{ display: isCheckHat ? 'block' : 'none' }}><i className="fa-solid fa-list"></i> {t('Mirror 4')} </label>
                                            <Form.Item
                                                hidden={!isCheckHat}
                                                name={nameof<GrantItem>('mirror4')}>
                                                <Input size={'middle'} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                </div>

                                {/* ADITIONAL INFO */}
                                <div className="box-container">

                                    <p className="title-edit">{t('Additional information')} <i className="fa-solid fa-circle-info"></i></p>

                                    <Row className="edit-container">

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-database"></i> {t('Source of the founds')}</label>
                                            <FormItem name={nameof<GrantItem>('source')}>
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
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-user-group"></i> {t('Beneficiary Source')}</label>
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
                                            <label> <i className="fa-solid fa-thumbtack"></i> {t('Region')}</label>
                                            <FormItem name={nameof<GrantItem>('locationsShow')}>
                                                <LocationSelect fullLoad={false} countries={[{ value: countryId, label: '' }]} />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-tag"></i> {t('Typology of project')}</label>
                                            <FormItem name={nameof<GrantItem>('typologiesShow')}>
                                                <TypologySelect
                                                    mode={"multiple"}
                                                    onChange={(value2) => onTypologiesChanges(value2)}
                                                />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-tag"></i> {t('Sectors')}</label>
                                            <FormItem name={nameof<GrantItem>('sectorsShow')}>
                                                <SectorAllSelect mode={"multiple"} onChange={(value) => onSectorChanges(value)} />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-user"></i> {t('Beneficiary Type')}</label>
                                            <FormItem name={nameof<GrantItem>('beneficiaryTypesShow')}>
                                                <BeneficiaryTypeSelect mode={"multiple"} />
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-tag"></i> {t('Target Sectors')}</label>
                                            <FormItem name={nameof<GrantItem>('targetSectorsShow')}>
                                                <TargetSectorAllSelect mode={"multiple"} onChange={(value) => onTargetSectorChanges(value)} />
                                            </FormItem>
                                        </Col>


                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-handshake"></i> {t('Modality of Participation')}</label>
                                            <Form.Item name={nameof<GrantItem>('modalityParticipation')}>
                                                <Select
                                                    onChange={() => onChangeModify('modifyModalityParticipation')}
                                                    size={'middle'}
                                                    style={{ width: '100%' }}
                                                    placeholder={t("Select a Modality of Participation")}
                                                >
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

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-money-check-dollar"></i> {t('Financing Modality')}</label>
                                            <Form.Item name={nameof<GrantItem>('financingModalityValue')}>
                                                <Select
                                                    onChange={() => onChangeModify('modifyFinancingModality')}
                                                    size={'middle'}
                                                    style={{ width: '100%' }}
                                                    placeholder={t("Select a Financing Modality")}
                                                    mode='multiple'
                                                >
                                                    {
                                                        financingModality.map(x => (
                                                            <Select.Option key={x.title} value={x.title}>
                                                                {t(x.title)}
                                                            </Select.Option>
                                                        ))
                                                    }
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label><i className="fa-solid fa-window-restore"></i> {t('Official Source')}</label>
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

                                        <Col span={24}>
                                            <label> <i className="fa-solid fa-building"></i> {t('Organism')}</label>
                                            <Space.Compact size="middle" className='organism-inputs'>
                                                <Form.Item name={nameof<GrantItem>('organism')}>
                                                    <Input size={'middle'} placeholder={t("Organism Value")} onChange={() => onChangeModify('modifyOrganism')} />
                                                </Form.Item>
                                                <Form.Item name={nameof<GrantItem>('organismUrl')}>
                                                    <Input prefix={<LinkOutlined />} size={'middle'} placeholder={t("Organism Url")} />
                                                </Form.Item>
                                            </Space.Compact>
                                        </Col>

                                        <Col span={24}>
                                            <label> <i className="fa-solid fa-eye"></i> {t('Observations')}</label>
                                            <Form.Item name={nameof<GrantItem>('observations')}>
                                                <TextArea rows={3} size={'middle'} cols={20} autoSize={{ minRows: 3, maxRows: 5 }} onChange={() => onChangeModify('modifyObservations')} />
                                            </Form.Item>
                                        </Col>

                                    </Row>

                                </div>

                                {/* DATES */}
                                <div className="box-container">

                                    <p className="title-edit">{t('Call Dates')} <i className="fa-solid fa-clock"></i></p>

                                    <Row className="edit-container">

                                        <Col span={8}>
                                            <label> <i className="fa-sharp fa-solid fa-circle-exclamation"></i> {t('Publication Date')}</label>
                                            <Form.Item name={nameof<GrantItem>('publicationDateShow')}>
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    getPopupContainer={(triggerNode) => {
                                                        return triggerNode.parentNode as HTMLElement
                                                    }}
                                                    format={dateFormat}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24} id='periods'>
                                            <Form.Item name={nameof<GrantItem>('periods')}>
                                                <DatePeriods value={grant.periods} format={dateFormat} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24}>
                                            <label> <i className="fa-solid fa-bullseye"></i> {t('Closing Date (Description)')}</label>
                                            <Form.Item name={nameof<GrantItem>('deadline')}>
                                                <TextArea rows={3} size={'middle'} style={{ width: '100%' }} cols={20} autoSize={{ minRows: 2, maxRows: 5 }} onChange={() => onChangeModify('modifyDeadline')} />
                                            </Form.Item>
                                        </Col>

                                    </Row>
                                </div>

                                {/* BUDGET */}
                                <div className="box-container">

                                    <p className="title-edit">{t('Call and Project Budget')} <i className="fa-solid fa-sack-dollar"></i></p>

                                    <Row className="edit-container">


                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-money-bill-1-wave"></i> {t('Total Budget')}</label>

                                            <Form.Item name={nameof<GrantItem>('totalBudget')}>

                                                <InputNumber
                                                    addonAfter={<strong>{t(getCountryCurrencyById(grant.countryId))} </strong>}
                                                    formatter={(value) => formatterBudget(value)}
                                                    parser={parserBudget} min={0}
                                                    style={{ width: '100%' }}
                                                />

                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-money-check-dollar"></i> {t('Grant Budget')}</label>
                                            <Form.Item name={nameof<GrantItem>('grantBudget')}>
                                                <InputNumber
                                                    addonAfter={<strong>{t(getCountryCurrencyById(grant.countryId))} </strong>}
                                                    formatter={(value) => formatterBudget(value)}
                                                    parser={parserBudget} min={0}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-coins"></i> {t('Min Budget')}</label>
                                            <Form.Item name={nameof<GrantItem>('minBudget')}>
                                                <InputNumber
                                                    addonAfter={<strong>{t(getCountryCurrencyById(grant.countryId))} </strong>}
                                                    formatter={(value) => formatterBudget(value)}
                                                    parser={parserBudget} min={0}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-sack-dollar"></i> {t('Max Budget')}</label>
                                            <Form.Item name={nameof<GrantItem>('maxBudget')}>
                                                <InputNumber
                                                    addonAfter={<strong>{t(getCountryCurrencyById(grant.countryId))} </strong>}
                                                    formatter={(value) => formatterBudget(value)}
                                                    parser={parserBudget} min={0}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-percent"></i> {t('FI Success Rate')}</label>
                                            <Form.Item name={nameof<GrantItem>('fiSuccessRate')}>
                                                <InputNumber
                                                    size={'middle'}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={100}
                                                    formatter={value => !!value ? `${value}%` : ``} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label>{t('Success Rate')}</label>
                                            <Form.Item name={nameof<GrantItem>('successRate')}>
                                                <Input size={'middle'} style={{ borderColor: 'none !important' }} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-barcode"></i> {t('Projects Group')}</label>
                                            <Form.Item name={nameof<GrantItem>('projectGroup')}
                                                rules={countryId === "Es" ?
                                                    [{ required: true, message: t("The Projects is required") }]
                                                    : []}
                                            >
                                                <ProjectGroupSelect countryId={countryId} />
                                            </Form.Item>
                                        </Col>

                                        {isAdmin &&
                                            <Col span={(countryId === "Es" || countryId === "Eu") ? 12 : 0}>
                                                {countryId === "Es" &&
                                                    <label>{t('Code BDNS')}</label>}
                                                <Form.Item
                                                    name={nameof<GrantItem>('codesBDNS')}
                                                    initialValue={grant.codesBDNS}
                                                    rules={[{ required: countryId === "Es", message: t("The code is required") }]}
                                                    hidden={countryId !== "Es"}
                                                >
                                                    <Select
                                                        mode="tags"
                                                        style={{ width: '100%' }}
                                                    >
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        }

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-phone"></i> {t('Public Body Contact Phone')}</label>
                                            <Form.Item name={nameof<GrantItem>('publicBodyContactPhone')}>
                                                <Input size={'middle'} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-envelope"></i> {t('Public Body Contact Email')}</label>
                                            <Form.Item name={nameof<GrantItem>('publicBodyContactEmail')}>
                                                <Input size={'middle'} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <label> <i className="fa-solid fa-handshake"></i> {t('Aid Intensity')}</label>
                                            <FormItem
                                                name={nameof<GrantItem>('aidIntensity')}>
                                                <Input size={'large'} onChange={() => onChangeModify('modifyAidIntensity')} />
                                            </FormItem>
                                        </Col>

                                        <div className="check-box-container">
                                            <Form.Item className="check-box-item" label={t('Warranties')} valuePropName={'checked'} name={nameof<GrantItem>('warranties')}>
                                                <Checkbox />
                                            </Form.Item>

                                            <Form.Item className="check-box-item" label={t('Advance')} valuePropName={'checked'} name={nameof<GrantItem>('advance')}>
                                                <Checkbox />
                                            </Form.Item>
                                        </div>

                                    </Row>
                                </div>

                                {/* CHECK BOX */}
                                <div className="container-check">

                                    <Row className="row-check">
                                        <Form.Item className="col-check" label={t('Published')} valuePropName={'checked'} name={nameof<GrantItem>('published')}>
                                            <Checkbox />
                                        </Form.Item>

                                        <Form.Item className="col-check" label={t('Minimis')} valuePropName={'checked'} name={nameof<GrantItem>('minimis')}>
                                            <Checkbox />
                                        </Form.Item>

                                        <Form.Item className="col-check" label={t('Interest')} valuePropName={'checked'} name={nameof<GrantItem>('interest')}>
                                            <Checkbox />
                                        </Form.Item>
                                    </Row>

                                    <Row className="row-check">

                                        <Form.Item className="col-check" label={t('Summary')} valuePropName={'checked'} name={nameof<GrantItem>('summary')}>
                                            <Checkbox />
                                        </Form.Item>

                                        <Form.Item className="col-check" label={t('Web Published')} valuePropName={'checked'} name={nameof<GrantItem>('webPublished')}>
                                            <Checkbox />
                                        </Form.Item>

                                        <Form.Item className="col-check" label={t('CON Newsletter')} valuePropName={'checked'} name={nameof<GrantItem>('conNewsLetter')}>
                                            <Checkbox />
                                        </Form.Item>
                                    </Row>

                                </div>

                                {/* UPLOAD DOCUMENTS */}
                                <div className="box-container">

                                    <p className="title-edit">{t('Documents Manager')} <i className="fa-sharp fa-solid fa-cloud-arrow-up"></i></p>

                                    <div className="edit-container">
                                        <Form.Item label={t('Files')} name={nameof<GrantItem>('files')} className="form-documents">
                                            <FileAttachmentsSelectorView identity={identity} grantId={grant.id} onChangeListFiles={() => { setReloadFileList(!reloadFileList) }} />
                                        </Form.Item>

                                    </div>
                                </div>

                                <p style={{ marginLeft: '10px' }} className="title-edit">{t('Documents')}</p>
                                <div className="doc-container">
                                    {finalAllowedFileToolsKeys.length > 0 && (isAdmin || grantHasResume()) &&
                                        <div className="card-container">
                                            <Card title={t('Tools')} className="card-annexes">
                                                <FileGeneralDetail key={grant.id} grantId={grant.id} fileKeys={finalAllowedFileToolsKeys} reload={reloadFileList} />
                                            </Card>
                                        </div>
                                    }

                                    {finalAllowedFileRegulationsKeys.length > 0 &&
                                        <div className="card-container">
                                            <Card title={t('Regulations')} className="card-annexes">
                                                <FileGeneralDetail key={grant.id} grantId={grant.id} fileKeys={finalAllowedFileRegulationsKeys} reload={reloadFileList} />
                                            </Card>
                                        </div>
                                    }
                                </div>
                            </div>

                        </>
                    )}

                </>
            )
            }
        </>
    )
}

export default withUserProfile(withTranslation()(GrantEdit))
