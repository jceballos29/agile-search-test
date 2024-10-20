import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Alert, Col, Row } from 'antd';

interface DaysSelectorEditorProps extends WithTranslation {
  disabled?: boolean;
  onChange?: (value: string) => void;
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  days: string | undefined;
}

interface DaysSelectorEditorState {
  selectionStatus: { [day: number]: boolean };
  frecuency?: 'Daily' | 'Weekly' | 'Monthly' | 'Snapshots';
}

class DaysSelectorEditor extends React.Component<DaysSelectorEditorProps, DaysSelectorEditorState> {
  constructor(props: DaysSelectorEditorProps) {
    super(props);
    this.state = {
      selectionStatus: {},
      frecuency: props.frequency,
    };
  }

  componentWillMount() {
    if (this.props.days) {
      const days = this.props.days.split(',');
      const selection: { [day: number]: boolean } = {};
      days.forEach((day) => {
        selection[+day] = true;
      });
      this.setState({ selectionStatus: selection });
    }
  }

  componentWillReceiveProps(nextProps: DaysSelectorEditorProps) {
    if (nextProps.frequency !== this.props.frequency) this.setState({ selectionStatus: {}, frecuency: nextProps.frequency });
  }

  private onChange(value: { [day: number]: boolean }) {
    if (this.props.onChange) {
      const days = Object.keys(value)
        .filter((key: string) => value[+key])
        .sort();
      this.props.onChange(days.join(','));
    }
  }

  private toggleSelection(day: number) {
    const newSelectionStatus = {
      ...this.state.selectionStatus,
    };
    if (newSelectionStatus[day] === undefined) {
      newSelectionStatus[day] = true;
    } else {
      newSelectionStatus[day] = !newSelectionStatus[day];
    }
    this.setState({ selectionStatus: newSelectionStatus }, () => this.onChange(this.state.selectionStatus));
  }

  public render() {
    const { t } = this.props;
    return (
      <div>
        {this.state.frecuency === 'Daily' && (
          <Alert message={t('For the daily frequency, the selection of days is not necessary')} type={'info'}></Alert>
        )}
        {this.state.frecuency === 'Snapshots' && (
          <Alert message={t('For the snapshots frequency, the selection of days is not necessary')} type={'info'}></Alert>
        )}
        {this.state.frecuency === 'Weekly' && (
          <div style={{ border: '1px solid #D9D9D9', paddingTop: 10, paddingBottom: 10 }}>
            <Row gutter={20} justify="center">
              {[
                { label: t('Mon'), value: 1 },
                { label: t('Tue'), value: 2 },
                { label: t('Wed'), value: 3 },
                { label: t('Thu'), value: 4 },
                { label: t('Fri'), value: 5 },
                { label: t('Sat'), value: 6 },
                { label: t('Sun'), value: 0 },
              ].map((item) => (
                <Col key={item.value} span={3} className="day-item" onClick={() => this.toggleSelection(item.value)}>
                  <div
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      border: this.state.selectionStatus[item.value] ? '1px solid  rgb(0,0,164)' : 'none',
                      background: this.state.selectionStatus[item.value] ? 'rgb(0,0,164)' : 'white',
                      color: this.state.selectionStatus[item.value] ? 'white' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {t(item.label)}
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
        {this.state.frecuency === 'Monthly' && (
          <div style={{ border: '1px solid #D9D9D9', paddingTop: 10, paddingBottom: 10 }}>
            <Row gutter={[20, 10]} justify="center">
              {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
                <Col key={item} span={3} className="day-item" onClick={() => this.toggleSelection(index + 1)}>
                  <div
                    style={{
                      textAlign: 'center',
                      border: this.state.selectionStatus[item] ? '1px solid #00B1FF' : 'none',
                      color: this.state.selectionStatus[item] ? '#00B1FF' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {item}
                  </div>
                </Col>
              ))}
            </Row>
            <Row gutter={[20, 10]} justify="center">
              {[8, 9, 10, 11, 12, 13, 14].map((item, index) => (
                <Col key={item} span={3} className="day-item" onClick={() => this.toggleSelection(item)}>
                  <div
                    style={{
                      textAlign: 'center',
                      border: this.state.selectionStatus[item] ? '1px solid #00B1FF' : 'none',
                      color: this.state.selectionStatus[item] ? '#00B1FF' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {item}
                  </div>
                </Col>
              ))}
            </Row>
            <Row gutter={[20, 10]} justify="center">
              {[15, 16, 17, 18, 19, 20, 21].map((item, index) => (
                <Col key={item} span={3} className="day-item" onClick={() => this.toggleSelection(item)}>
                  <div
                    style={{
                      textAlign: 'center',
                      border: this.state.selectionStatus[item] ? '1px solid #00B1FF' : 'none',
                      color: this.state.selectionStatus[item] ? '#00B1FF' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {item}
                  </div>
                </Col>
              ))}
            </Row>
            <Row gutter={[20, 10]} justify="center">
              {[22, 23, 24, 25, 26, 27, 28].map((item, index) => (
                <Col key={item} span={3} className="day-item" onClick={() => this.toggleSelection(item)}>
                  <div
                    style={{
                      textAlign: 'center',
                      border: this.state.selectionStatus[item] ? '1px solid #00B1FF' : 'none',
                      color: this.state.selectionStatus[item] ? '#00B1FF' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {item}
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation()(DaysSelectorEditor);
