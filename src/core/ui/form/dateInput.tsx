import * as React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import autobind from 'autobind-decorator';

interface DateInputProps {
    value?: Date;
    onChange?: (value: Date | undefined) => void;
    format?: string;
    width?: number;
    disabled?: boolean; 
}

interface DateInputState {
    value: Date | undefined;
    format: string;
}

export class DateInput extends React.Component<DateInputProps, DateInputState> {

    constructor(props: DateInputProps) {
        super(props);
        this.state = {
            value: props.value,
            format: props.format || 'DD-MM-YYYY',
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: DateInputProps) {
        this.setState({ value: nextProps.value });
    }

    @autobind
    private handleValue(momentDate: any) {
        let date: Date | undefined = undefined;
        if (momentDate != null) {
            date = momentDate.toDate();
        }

        this.setState({ value: date });
        if (this.props.onChange) {
            this.props.onChange(date);
        }
    }

    public render() {
        return <DatePicker disabled={ this.props.disabled} style={{ width: this.props.width || '100%' }} format={this.state.format} value={(this.state.value ? moment(this.state.value || new Date()) : undefined) as any} onChange={this.handleValue} />
    }
}