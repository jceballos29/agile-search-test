import { withTranslation, WithTranslation } from 'react-i18next';
import { GrantItem } from '../../../../stores/grant-store';
import React, { FC } from 'react';

import { Col, Form, Input, Row } from 'antd';
import { nameof } from '../../../../core/utils/object';
import FileAttachmentsSelectorView from '../../../../components/file-attachments';
import { IdentityProps } from '../../../../core/services/authentication';

interface GrantUploadProps extends WithTranslation, IdentityProps {
    url: string;
    grant: GrantItem;
}

const GrantUpload: FC<GrantUploadProps> = (props) => {
    const { t, grant, identity } = props;

    return (
        <>
            {grant && (
                <>
                    {grant.countryId && (
                        <Row>
                            <Col md={24} sm={24} style={{ padding: '5px' }}>
                                <div style={{ paddingTop: 18 }}>
                                   
                                    <Form.Item label={t('Id')} name={nameof<GrantItem>('id')} hidden>
                                        <Input size={'middle'} hidden disabled />
                                    </Form.Item>

                                    <div>
                                        <span
                                            style={{
                                                fontSize: 17,
                                                fontFamily: 'Century Gothic',
                                                fontWeight: 'bold',
                                                color: '#364966',
                                                paddingBottom: 10,
                                                width : '100%'
                                            }}
                                            className={'grants'}
                                        >
                                            {t('Documents Manager')}
                                        </span>
                                    </div>

                                    <div style={{ paddingTop: 10 }}>
                                        <Form.Item label={t('Files')} name={nameof<GrantItem>('files')}>
                                            <FileAttachmentsSelectorView identity={identity} grantId={grant.id} />
                                        </Form.Item>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </>
            )
            }
        </>
    )
};

export default withTranslation()(GrantUpload);
