import { FC, useEffect, useState } from "react";
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
    messageToEdit: Message;
    form: FormInstance<FeaturedMessagesProps>;
    changeVisibleEditMessageModal: (newstate :boolean) => void 
}


const { RangePicker } = DatePicker;

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return  current < moment().add(-1, 'days');
};

const formatRangePicker = 'YYYY-MM-DD';

const FeaturedMessagesEdit: FC<FeaturedMessagesProps> = ({t, changeVisibleEditMessageModal, userProfile, messageToEdit}) => {
    const [selectedAreas, setSelectedAreas] = useState<string[]>(messageToEdit.areas);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>(messageToEdit.departments);
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

    useEffect(() => {
        
    },[messageToEdit]);

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

            const messageToUpdate = {
                id : messageToEdit.id,
                messageTitle : item.messageTitle,
                message : item.message,
                areas : item.areas || [],
                departments : item.departments || [],
                offices : item.offices || [],
                startPublicationDate : item.startPublicationDate[0].format(),
                endPublicationDate : item.startPublicationDate[1].format()
            } as Message;

            if(!validateUpdates(messageToEdit, messageToUpdate)) return;

            const result = await httpService.put(`api/v1/featured-messages`, messageToUpdate);
            
            if(result.data !== null && result.status === 200){
                message.success(`${t('Featured message updated successfully')}.`);
                changeVisibleEditMessageModal(false);
            }else{
                message.error(`${t('Featured message update failed')}`);
            }
        }
        catch(ex)
        {
            message.error(`${t('Featured message update failed')} - ${ex}.`);
        }
    }

    const handleCancelEditFeaturedMessage = () => {
        changeVisibleEditMessageModal(false);
    }

    const validateUpdates = (oldMessage : Message, newMessage : Message) => {
        if(oldMessage.messageTitle == newMessage.messageTitle 
            && oldMessage.message == newMessage.message
            && oldMessage.areas.filter(a => !newMessage.areas.includes(a)).concat(newMessage.areas.filter(x => !oldMessage.areas.includes(x))).length == 0
            && oldMessage.departments.filter(a => !newMessage.departments.includes(a)).concat(newMessage.departments.filter(x => !oldMessage.departments.includes(x))).length == 0
            //&& oldMessage.offices.filter(a => !newMessage.offices.includes(a)).concat(newMessage.offices.filter(x => !oldMessage.offices.includes(x))).length == 0
            && oldMessage.startPublicationDate == newMessage.startPublicationDate
            && oldMessage.endPublicationDate == newMessage.endPublicationDate){
                message.warning(`${t('No changes to save yet')}.`);
                return false;
            }
        
        return true;
    }

    return(
        <>
            <Modal
                style={{ top: 10 }}
                width={'40%'}
                maskClosable={true}
                title={t('Edit Message')}
                visible={true}
                onOk={handleCreateFeaturedMessage}
                onCancel={handleCancelEditFeaturedMessage}
                footer={[
                <Button key="back" onClick={handleCancelEditFeaturedMessage}>
                    {t('Cancel')}
                </Button>,
                <Button key="submit" type="primary" loading={modalLoading} onClick={handleCreateFeaturedMessage}>
                    {t('Save')}
                </Button>,
                ]}
            >
                
                <Form form={form} size={'small'} layout={'horizontal'}>
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The title is required") }]} label={t('Message Title')} initialValue={messageToEdit.messageTitle} name={nameof<Message>('messageTitle')}>
                            <Input showCount maxLength={55} size="middle"/>
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The name is required") }]} label={t('Message')} initialValue={messageToEdit.message} name={nameof<Message>('message')} >
                            <TextArea showCount maxLength={250} rows={4} size="large"/>
                        </Form.Item>
                    </Col>
                    <Col>
                        <span className="ad"><InfoCircleTwoTone/>&nbsp;&nbsp;{t("If an area is not selected, they will be published to all")}</span>
                        <Form.Item id='areas' label={t('Areas')} name={nameof<Message>('areas')} initialValue={messageToEdit.areas}>
                            <AreaSelect mode="multiple" size="middle" onChange={handleAreasChanges}/>
                        </Form.Item>
                    </Col>
                    {/* <Col>
                        <span className="ad"><InfoCircleTwoTone/>&nbsp;&nbsp;{t("Departments must be entered manually")}</span>
                        <Form.Item id='department' label={t('Departments')} name={nameof<Message>('departments')} initialValue={messageToEdit.departments}>
                            <DepartmentSelect size="middle" tagMode={true} onChange={handleDepartmentsChanges} defaultValue={messageToEdit.departments}/>
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The office is required") }]} label={t('Offices')} name={nameof<Message>('offices')} >
                            <DepartmentSelect size="middle" tagMode={true} onChange={handleDepartmentsChanges} />
                        </Form.Item>
                    </Col> */}
                    <Col>
                        <Form.Item rules={[{ required: true, message: t("The publication range date is required") }]} label={t('Publication range date')} name={nameof<Message>('startPublicationDate')} initialValue={[moment(messageToEdit.startPublicationDate), moment(messageToEdit.endPublicationDate)]} >
                            <RangePicker size="middle" disabledDate={disabledDate} format={formatRangePicker}/>
                        </Form.Item>
                    </Col>
                </Form>
            </Modal>
        </>
    )
};

export default withTranslation()(withUserProfile(FeaturedMessagesEdit));