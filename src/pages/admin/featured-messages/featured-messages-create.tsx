import { FC, useState } from "react";
import { Button, Col, Form, FormInstance, Input, Modal, DatePicker, message } from "antd";
import { WithTranslation, withTranslation } from "react-i18next";
import { UserProfileProps, withUserProfile } from "src/components/user-profile";
import { nameof } from "src/core/utils/object";
import { Message } from "src/stores/featured-messages-store";
import DepartmentSelect from "src/components/department-select";
import type { RangePickerProps } from 'antd/es/date-picker';
import './featured-messages-style.less';
import moment from "moment";
import { container } from 'src/inversify.config';
import HttpService from "src/core/services/http.service";
import { InfoCircleTwoTone } from '@ant-design/icons';
import AreaSelect from "src/components/area-select";


interface FeaturedMessagesProps extends WithTranslation , UserProfileProps {
    messageToCreate: Message;
    form: FormInstance<FeaturedMessagesProps>;
    changeVisibleCreateMessageModal: (newstate :boolean) => void 
}


const { RangePicker } = DatePicker;

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return  current < moment().add(-1, 'days');
};

const FeaturedMessagesCreate: FC<FeaturedMessagesProps> = ({t, changeVisibleCreateMessageModal, userProfile}) => {
    const [selectedAreas, setSelectedAreas] = useState<string[]>();
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>();
    const [modalLoading, setModalLoading] = useState(false);
    const { TextArea } = Input;
    const [form] = Form.useForm<Message>();
    const httpService = container.get(HttpService);

    const handleAreasChanges = (values: string[]) => {
        form.setFieldsValue({ 
            areas : values,
            departments : selectedDepartments
        });
        setSelectedAreas(values);
    };

    const handleDepartmentsChanges = (values: string[]) => {
        form.setFieldsValue({ 
            departments : values,
            areas : selectedAreas
        });
        setSelectedDepartments(values);
    };

    const handleCreateFeaturedMessage = async () => {
        let item: Message
        try {
            item = await form.validateFields();
        } catch (e) {
            return
        }

        try
        {
            if(item.areas == null || item.areas.length == 0){
                item.areas = userProfile.areas;
            }
            const result = await httpService.post(`api/v1/featured-messages`, {
                messageTitle : item.messageTitle,
                message : item.message,
                areas : item.areas || [],
                departments : item.departments || [],
                offices : item.offices || [],
                startPublicationDate : item.startPublicationDate[0],
                endPublicationDate : item.startPublicationDate[1]
            } as Message);
            
            if(result.data !== null && result.status === 200){
                message.success(`${t('Featured message created successfully')}.`);
                changeVisibleCreateMessageModal(false);
            }else{
                message.error(`${t('Featured message create failed')}.`);
            }
        }
        catch(ex)
        {
            message.error(`${t('Featured message create failed')} - ${ex}.`);
            
        }
       
    }

    const handleCancelCreateFeaturedMessage = () => {
        changeVisibleCreateMessageModal(false);
    }

    return(
        <>
            <Modal
                style={{ top: 10 }}
                width={'40%'}
                maskClosable={true}
                title={t('Create Message')}
                visible={true}
                onOk={handleCreateFeaturedMessage}
                onCancel={handleCancelCreateFeaturedMessage}
                footer={[
                <Button key="back" onClick={handleCancelCreateFeaturedMessage}>
                    {t('Cancel')}
                </Button>,
                <Button key="submit" type="primary" loading={modalLoading} onClick={handleCreateFeaturedMessage}>
                    {t('Create')}
                </Button>,
                ]}
            >
                
                <Form form={form} size={'small'} layout={'horizontal'}>
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The title is required") }]} label={t('Message Title')} name={nameof<Message>('messageTitle')}>
                            <Input showCount maxLength={55} size="middle"/>
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The name is required") }]} label={t('Message')} name={nameof<Message>('message')} >
                            <TextArea showCount maxLength={250} rows={4} size="large" />
                        </Form.Item>
                    </Col>
                    <Col>
                        <span className="ad"><InfoCircleTwoTone/>&nbsp;&nbsp;{t("If an area is not selected, they will be published to all")}</span>
                        <Form.Item label={t('Areas')} name={nameof<Message>('areas')} >
                            <AreaSelect mode="multiple" size="middle" onChange={handleAreasChanges} />
                        </Form.Item>
                    </Col>
                    {/* <Col>
                        <span className="ad"><InfoCircleTwoTone/>&nbsp;&nbsp;{t("Departments must be entered manually")}</span>
                        <Form.Item label={t('Departments')} name={nameof<Message>('departments')} >
                            <DepartmentSelect size="middle" tagMode={true} onChange={handleDepartmentsChanges} />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The office is required") }]} label={t('Offices')} name={nameof<Message>('offices')} >
                            <DepartmentSelect size="middle" tagMode={true} onChange={handleDepartmentsChanges} />
                        </Form.Item>
                    </Col> */}
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The publication range date is required") }]} label={t('Publication range date')} name={nameof<Message>('startPublicationDate')} >
                            <RangePicker size="middle" disabledDate={disabledDate} />
                        </Form.Item>
                    </Col>
                </Form>
            </Modal>
        </>
    )
};

export default withTranslation()(withUserProfile(FeaturedMessagesCreate));