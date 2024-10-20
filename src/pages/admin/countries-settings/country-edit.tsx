import { withTranslation, WithTranslation } from 'react-i18next';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Alert, Card, Checkbox, Col, DatePicker, Form, FormInstance, Input, InputNumber, Row, Select, Tag, Tooltip, Upload } from 'antd';
import { formatDate, formatDateTime, nameof } from '../../../core/utils/object';
import { IdentityProps } from '../../../core/services/authentication';
import { CountryItem } from '../../../stores/country-store';
import Dragger from 'antd/lib/upload/Dragger';
import Icon, { InboxOutlined, SmileOutlined } from '@ant-design/icons';

interface CountryProps extends WithTranslation {
    country: CountryItem;
    form: FormInstance<CountryItem>;
}

const CountryEdit: FC<CountryProps> = (props) => {
    const { t, country, form } = props;

    const [iconUrl, setIconUrl] = useState<string | undefined>()
    const inputRef = useRef<any>();

    useEffect(() => {
        setIconUrl(country.icon)
    }, []);

    const getBase64 = (file: File) => {
       
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setIconUrl(reader.result as string)

            form.setFieldsValue({
                icon: reader.result as string
            })
        })
        reader.readAsDataURL(file)

        return false
    }

    return (
        <>
            {
                <Row>
                    <Col md={24} sm={24} style={{ padding: '5px' }}>
                        <Form.Item
                            rules={[{ required: true, message: t("The name is required") }]}
                            label={t('Name')} name={nameof<CountryItem>('name')}>
                            <Input size={'large'} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col md={24} sm={24} style={{ padding: '5px' }}>
                        <Form.Item 
                            rules={[{ required: true, message: t("The code is required") }]}
                            label={t('Code')} name={nameof<CountryItem>('code')}>
                            <Input size={'large'} style={{ width: '100%' }} disabled />
                        </Form.Item>
                    </Col>

                    <Col md={24} sm={24} style={{ padding: '5px' }}>
                        <Form.Item
                            rules={[{ required: true, message: t("The currency is required") }]}
                            label={t('Currency')} name={nameof<CountryItem>('currency')}>

                            <Select size={'middle'} style={{ width: '100%' }} placeholder={t("Select a Currency")}>
                                <Select.Option key={'A'} value={'USD'}>
                                    {('USD ') + t('USD')}
                                </Select.Option>
                                <Select.Option key={'B'} value={'BRL'}>
                                    {('BRL ') + t('BRL')}
                                </Select.Option>
                                <Select.Option key={'C'} value={'JPY'}>
                                    {('JPY ') + t('JPY')}
                                </Select.Option>
                                <Select.Option key={'D'} value={'SGD'}>
                                    {('SGD ') + t('SGD')}
                                </Select.Option>
                                <Select.Option key={'E'} value={'GBP'}>
                                    {('GBP ') + t('GBP')}
                                </Select.Option>
                                <Select.Option key={'F'} value={'EUR'}>
                                    {('EUR ') + t('EUR')}
                                </Select.Option>
                            </Select>

                        </Form.Item>
                    </Col>

                    <Col md={24} sm={24} style={{ padding: '5px' }}>
                        <Form.Item label={t("Icon")}
                            name={nameof<CountryItem>('icon')}>
                            <Input placeholder={t("Icon (Ant Icon, URL or base64 image)")}
                                onChange={e => setIconUrl(e.target.value)} hidden />
                        </Form.Item>
                        <Form.Item name={'icon-load'}>
                            <Dragger
                                showUploadList={false}                                
                                beforeUpload={file => getBase64(file)}
                            >
                                {iconUrl ?
                                    <img width="100px" src={iconUrl} /> :
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                }
                                <p className="ant-upload-text">
                                    {t("Click or drag file to update the app picture")}
                                </p>
                            </Dragger>
                        </Form.Item>
                    </Col>
                </Row>
            }
        </>
    );
};

export default withTranslation()(CountryEdit);
