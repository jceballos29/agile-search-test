
import * as React from 'react';
import { InputNumber } from 'antd';

interface ICurrencyInputProps {
    currencySymbol?: string;
    value?: number;
    min?: number;
    max?: number;
    onChange?: (e: number) => void;
    onBlur?: () => void;
    style?: any;
    disabled?: boolean;
}

interface ICurrencyInputState {

}

export default class CurrencyInput extends React.Component<ICurrencyInputProps, ICurrencyInputState>{

    render() {

        const symbol = this.props.currencySymbol || "€";
        const pattern = `${symbol}\s?|(,*)`

        return <InputNumber
            min={this.props.min}
            step={0.05}
            formatter={value => `${value} €`.replace(/\./g, ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={value => Number((value as String).replace(/\s|€|(\.*)/g, '').replace(/\,/g, '.'))}
            value={this.props.value}
            precision={2}
            onBlur={() => {
                if (this.props.onBlur)
                    this.props.onBlur();
            }}
            onChange={this.props.onChange as any}
            style={this.props.style}
            disabled={this.props.disabled}
        />;
    }
}
