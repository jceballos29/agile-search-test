import React from "react";
import { Table, Row, Col, Card } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { GetCountryFlag } from '../flags-icons'

class ComponentToPrint extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {
        return (
            <div style={{ padding: '10px' }}>
                <Table
                    rowKey={(record) => "pdf-calendar-" + record.id}
                    size='small'
                    columns={this.props.columns}
                    dataSource={this.props.dataSource}
                    pagination={false}
                />
                <div style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: 'rgb(0,0,164)', marginBottom: '12px', marginTop: '15px' }}>
                    <CalendarOutlined />
                    <span style={{ marginLeft: '10px' }}>{this.props.t("Report from calendar")}</span></div>
                {
                    this.props.dataSource.map((data) => {
                        return (
                            <Card bordered={false}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span>{GetCountryFlag(data.countryId, this.props.countries)}</span>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold', marginLeft: '10px' }}>{data.title}</span>
                                </div>
                                <Row>
                                    {
                                        data.periods.length > 0 ?
                                            <Col span={9}>
                                                <div style={{ fontWeight: 'bold' }}>{this.props.t("Periods")}</div>
                                                {
                                                    data.periods.map((p) => {
                                                        if (p)
                                                            return (
                                                                <div>
                                                                    {`${this.props.t("Openning date")}: ${p.openningDate ? p.openningDate.toString().substring(0, 10) : this.props.t('Undefined')}
                                                                  - ${this.props.t("Closing date")}: ${p.closingDate ? p.closingDate.toString().substring(0, 10) : this.props.t('Undefined')}`}
                                                                </div>
                                                            )
                                                        else return "";
                                                    })
                                                }
                                            </Col>
                                            : <Col span={9}>
                                                <div style={{ fontWeight: 'bold' }}>{this.props.t("Periods")}</div>
                                                <div >{this.props.t('No Dates')}</div>
                                            </Col>
                                    }

                                    <Col span={5}>
                                        <div style={{ fontWeight: 'bold' }}>{this.props.t("Publication Date")}</div>
                                        <div>{data.publicationDate ? data.publicationDate.toString().substring(0, 10) : this.props.t('Undefined')}</div>
                                    </Col>

                                    <Col span={5}>
                                        <div style={{ fontWeight: 'bold' }}>{this.props.t("Status")}</div>
                                        <div>{this.props.t(data.status)}</div>
                                    </Col>

                                    <Col span={5}>
                                        <div style={{ fontWeight: 'bold' }}>{this.props.t("Modality of Participation")}</div>
                                        <div>{this.props.t(data.modalityParticipation)}</div>
                                    </Col>
                                </Row>

                            </Card>
                        )
                    })
                }
            </div>
        );
    }
}
export default ComponentToPrint

