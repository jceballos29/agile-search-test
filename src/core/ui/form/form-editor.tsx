import * as React from 'react'
import { Alert, Form, Button, Spin } from 'antd';
import autobind from 'autobind-decorator';
import { withTranslation, WithTranslation } from 'react-i18next';
import { formatMessage } from '../../services/http.service';
import { FormInstance } from 'antd/lib/form';
import { CommandResult } from '../../stores/types';
let FormItem = Form.Item;

interface FormEditorViewProps extends WithTranslation {
    form: FormInstance,
    children: React.ReactChild,
    onSaveItem: (values: any) => Promise<any>
    style?: React.CSSProperties
}

interface FormEditorViewState {
    isBusy: boolean,
    result: CommandResult<any>;
}

class FormEditorView extends React.Component<FormEditorViewProps, FormEditorViewState> {
    constructor(props: FormEditorViewProps) {
        super(props);
        this.state = {
            isBusy: false,
            result: { isSuccess: true, item: undefined, error: undefined, messages: [] }
        }
    }

    @autobind
    private onSaveItem() {
        this.setState({ isBusy: true })
        var self = this;
        return new Promise((resolve, reject) => {
            self.props.form.validateFields();
            var values = self.props.form.getFieldsValue();
            if (!event) {
                return new Promise((resolve1, reject1) => {
                    self.props.onSaveItem(values).then(res => {
                        this.setState({ isBusy: false, result: res })
                        self.props.form.resetFields();
                        resolve(res);
                    }).catch(error => {
                        var parsedError = error && error.response && error.response.data && error.response.data.messages ? error.response.data : {
                            isSuccess: false,
                            items: [],
                            total: 0,
                            messages: [{ body: formatMessage(error), level: 'Error' }]
                        };
                        this.setState({ isBusy: false, result: parsedError })
                        reject1(error);
                    });
                });
            }
            else {
                this.setState({ isBusy: false })    
            };
        })
    }

    @autobind
    private onCancel() {
        this.props.form.resetFields();
        this.setState({ result: { isSuccess: true, error: undefined, messages: [] } });
    }

    render() {
        const childrenWithProps = React.Children.map(this.props.children, (child: any) => React.cloneElement(child, this.props));
        const { resetFields, isFieldsTouched } = this.props.form;
        const { t } = this.props as any;

        return <Spin spinning={this.state.isBusy}>
            {this.state.result && !this.state.result.isSuccess &&
                <Alert style={{ marginBottom: 16 }}
                    type='error'
                    message={t('An error ocurred')}
                    description={this.state.result.messages.map((o: any) => o.body)}
                />
            }
            <div style={this.props.style}>
                {childrenWithProps}
                <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                    {isFieldsTouched() && <div><Button type='primary' style={{ float: 'right' }} onClick={this.onSaveItem}>{t('Save')}</Button><Button type='default' style={{ float: 'right', marginRight: 10 }} onClick={this.onCancel}>{t('Cancel')}</Button></div>}
                </div>
            </div>
        </Spin>;
    }
}

export default withTranslation()(FormEditorView);
