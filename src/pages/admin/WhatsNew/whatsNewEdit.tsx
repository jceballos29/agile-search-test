import { Button, Form, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import FormItem from 'antd/lib/form/FormItem';
import { container } from 'src/inversify.config';
import HttpService, { formatMessage } from '../../../core/services/http.service';
import { CacheProps, withCache } from '../../../core/services/cache.service';
import { formatDate, formatDateTime, nameof } from '../../../core/utils/object';
import RichTextView from '../../../core/ui/form/rich-editor.view';
import { WhatsNew, WhatsNewStore, WhatsNewSummary } from '../../../stores/WhatsNew-store';


interface ConfigSettingHomeProps extends WithTranslation, RouteComponentProps, CacheProps {
    language: string;
}

const WhatsNewEdit: FC<ConfigSettingHomeProps> = (props) => {
    const { t, cache, language } = props;
    const [form] = Form.useForm<WhatsNew>()
    const httpService = container.get(HttpService)
    const [editItem, setEditItem] = useState({} as WhatsNew)
    const [errorWhatsNew, setErrorWhatsNew] = useState('')

    const whatsNewStore = container.get(WhatsNewStore);
    const whatsNewState = whatsNewStore.state;


    const loadfields = async () => { 
        
        const item= await whatsNewStore.load(language);
        
        const whatsNew = item.items[0];
        form.setFieldsValue({
            adminText: whatsNew.adminText,
            text: whatsNew.text            
        })
        setEditItem(whatsNew)        
       
    }
    
    useEffect(() => {
        loadfields()
    }, [])  

    const handleSave = async () => {
        let item: WhatsNewSummary
        try {
            item = await form.validateFields()
        } catch (e) {
            return
        }
        
        var errorText = ''
        await httpService
            .put(`/grants/api/v1/whatsNew/${language}`, item)
            .then((result) => {
               /* props.userProfile.reload()*/
            }
            )
            .catch((error) => {
                setErrorWhatsNew(t(error))
                errorText = error
            })
            .finally(() => {
                if (errorText == '') {
                    
                    setErrorWhatsNew('')
                    loadfields()
                }
               
            })
    }

    return (
        <>
            <Row>
                <Col span={24}>
                    <Form form={form} layout="vertical">                        
                        <Row>
                            <FormItem name={nameof<WhatsNew>('text')} label={t("Insert text for Users")} >                                

                                <RichTextView value={editItem.text} containerClassName="custom-wysiwyg-editor" />
                                
                            </FormItem>
                        </Row>
                        <Row>                           
                            <FormItem name={nameof<WhatsNew>('adminText')} label={t("Insert text for Managers")}>

                                <RichTextView value={editItem.adminText} containerClassName="custom-wysiwyg-editor" />

                            </FormItem>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row style={{ marginTop: 5 }}>
                <Button  style={{ float: 'right', margin: 3 }}  type="primary" onClick={handleSave}> {t("Save")} </Button>
                <Button  style={{ float: 'right', margin: 3 }} onClick={loadfields}> {t("Cancel")}  </Button>
            </Row>
        </>
    );
};

export default withCache(withTranslation()(withRouter(WhatsNewEdit)));
