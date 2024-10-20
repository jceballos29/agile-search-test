import { Button, Form, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { container } from 'src/inversify.config';
import { CacheProps, withCache } from '../../../core/services/cache.service';
import { WhatsNew, WhatsNewStore } from '../../../stores/WhatsNew-store';

interface ConfigSettingHomeProps extends WithTranslation, RouteComponentProps, CacheProps {
    manager: boolean;
   
}

const WhatsNewReport: FC<ConfigSettingHomeProps> = (props) => {
    const { t, cache, manager } = props;
    const [form] = Form.useForm<WhatsNew>()     
    const [textHtml, setTextHtml] = useState('')

    const whatsNewStore = container.get(WhatsNewStore);
    const whatsNewState = whatsNewStore.state;


    const showReport = async () => {

        const item = await whatsNewStore.load('en')
     
        const whatsNew = item.items[0];

        if (manager) {
            setTextHtml(whatsNew.adminText)
        } else {
            setTextHtml(whatsNew.text)
        }

        form.setFieldsValue({
            adminText: whatsNew.adminText,
            text: whatsNew.text
        })
    }
    
    useEffect(() => {
        showReport()
    }, [manager])
    
    return (         
        <p dangerouslySetInnerHTML={{ __html: textHtml }}></p>
    );
};

export default withCache(withTranslation()(withRouter(WhatsNewReport)));

