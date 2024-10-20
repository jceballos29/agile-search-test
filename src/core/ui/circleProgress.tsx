import * as React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'

interface CircleProgressProps extends WithTranslation {
    value?: number,
    title?: string,
}

interface CircleProgressState {

}

class CircleProgress extends React.Component<CircleProgressProps, CircleProgressState> {
    public render() {
        let { t } = this.props;
        var cifra = this.props.value || 0;
        return (<div className={`c100 p${cifra} ${cifra >= 100 ? 'green' : ''} small`} title={this.props.title}>
            <span>{cifra}%</span>
            <div className="slice">
                <div className="bar"></div>
                <div className="fill"></div>
            </div>
        </div>);
    }
}

export default withTranslation()(CircleProgress);