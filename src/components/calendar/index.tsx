import React, { FC, useEffect, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Tooltip, Table, Row, Col, Checkbox } from 'antd'
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { GrantBriefSummary } from '../../stores/grant-store'
import { ColumnsType } from 'antd/lib/table'
import './index.less'
import { Link } from 'react-router-dom'
import { GetCountryFlag } from '../flags-icons'
import { UserProfileProps, withUserProfile } from '../user-profile'
import ComponentToPrint from './calendarPdf'
import { Period } from 'src/pages/admin/publication-control/grants-edit/grant-edit'
import moment from 'moment'
import { putLengthLimitToText } from 'src/utils/helpers'

interface CalendarProps extends WithTranslation, UserProfileProps {
    currentYearMin: number,
    setCurrentYearMin: any,
    currentYearMax: number
    setCurrentYearMax: any,
    yearMin: any,
    yearMax: any,
    grants: GrantBriefSummary[],
    componentRef: any,
    firstMonth: number | null,
    setFirstMonth: any,
    setSelectedRows: any,
    selectedRows: any,
}


const Calendar: FC<CalendarProps> = (props) => {
    const { t, currentYearMin, currentYearMax, setCurrentYearMin, setCurrentYearMax, yearMin, yearMax, componentRef
        , firstMonth, setFirstMonth, setSelectedRows, selectedRows } = props

    const [columns, setColumns] = useState<ColumnsType<any>>([])
    const [columnsPdf, setColumnsPdf] = useState<ColumnsType<any>>([])

    const getDays = (year, month) => {
        return new Date(year, month, 0).getDate()
    }

    const isActive = (periods: Period[], day: number, month: number, year: number) => {
        const current = new Date(year, month - 1, day);
        for (var i = 0; i < periods.length; i++) {
            let fechaOpeningDate = new Date(periods[i].openningDate)
            let fechaClosingDate = new Date(periods[i].closingDate)

            const openingDate = new Date(fechaOpeningDate.getFullYear(), fechaOpeningDate.getMonth(), fechaOpeningDate.getDate())
            const closingDate = new Date(fechaClosingDate.getFullYear(), fechaClosingDate.getMonth(), fechaClosingDate.getDate())
            if (openingDate <= current && closingDate >= current) return true
        }
        return false
    }

    const formaterDate = (item: GrantBriefSummary, day: number, month: number, year: number): any => {
        const currentDay = new Date(year, month - 1, day);
        let tooltipText = null
        tooltipText = t("No Dates");

        item.periods.forEach(period => {
            let fechaOpeningDate = new Date(period.openningDate)
            let fechaClosingDate = new Date(period.closingDate)

            const openingDate = new Date(fechaOpeningDate.getFullYear(), fechaOpeningDate.getMonth(), fechaOpeningDate.getDate())
            const closingDate = new Date(fechaClosingDate.getFullYear(), fechaClosingDate.getMonth(), fechaClosingDate.getDate())
            if (openingDate <= currentDay && closingDate >= currentDay) {
                let obj = {
                    o: "",
                    c: ""
                }
                obj = buildTooltipText(openingDate, closingDate);

                tooltipText = <div>
                    <span><b>{t('Status')}</b>: {t(item.status)}</span> <br />
                    <span><b>{t('Opening Date')}</b>: {obj.o}</span> <br />
                    <span><b>{t('Closing Date')}</b>: {obj.c}</span> <br />
                    <span><b>{t("Financing Modality")}</b>: {item.financingModality.map(i => t(i)).toString()}</span> <br />
                    <span><b>{t("Mode of Participation")}</b>: {t(item.modalityParticipation)}</span>
                </div>

            }
        });
        return tooltipText;
    }

    const buildTooltipText = (openingDate: Date, closingDate: Date): any => {
        let _date = (moment(openingDate).format('L')).toString().split("/");
        const _year = _date[2];
        const _month = _date[0];
        const _day = _date[1];

        let date_ = (moment(closingDate).format('L')).toString().split("/");
        const year_ = date_[2];
        const month_ = date_[0];
        const day_ = date_[1];

        let obj = {
            o: `${_day}-${_month}-${_year}`,
            c: `${day_}-${month_}-${year_}`
        }

        return obj
    }

    const formaterDateClosed = (item: GrantBriefSummary, day: number, month: number, year: number): any => {
        const currentDay = new Date(year, month - 1, day);
        let tooltipText = null

        if (item.periods.length === 1) {
            tooltipText = <div>
                <span><b>{t('Status')}</b>: {t(item.status)}</span> <br />
                <span><b>{t('Opening Date')}</b>: {item.periods[0].openningDate}</span> <br />
                <span><b>{t('Closing Date')}</b>: {item.periods[0].closingDate}</span> <br />
                <span><b>{t("Financing Modality")}</b>: {item.financingModality.map(i => t(i)).toString()}</span> <br />
                <span><b>{t("Mode of Participation")}</b>: {t(item.modalityParticipation)}</span>
            </div>
        } else {
            let init_date = moment(currentDay)
            let oFuture = -1000000000
            let oPast = 100000000
            let openningDateFuture = null
            let openningDatePast = null

            let cFuture = -1000000000
            let cPast = 100000000
            let closingDateFuture = null
            let closingDatePast = null

            let swOD = false
            let swCD = false

            item.periods.forEach(period => {
                let endDateOpenningDate = moment(period.openningDate);
                let endDateClosingDate = moment(period.closingDate);
                let diffDaysOpenningDate = init_date.diff(endDateOpenningDate, 'days')
                let diffDaysClosingDate = init_date.diff(endDateClosingDate, 'days')

                if (diffDaysOpenningDate < 0) {
                    if (oFuture < diffDaysOpenningDate) {
                        oFuture = diffDaysOpenningDate
                        openningDateFuture = period.openningDate
                        swOD = true
                    }
                } else {
                    if (oFuture < diffDaysOpenningDate) {
                        oPast = diffDaysOpenningDate
                        openningDatePast = period.openningDate
                    }
                }

                if (diffDaysClosingDate < 0) {
                    if (cFuture < diffDaysClosingDate) {
                        cFuture = diffDaysClosingDate
                        closingDateFuture = period.closingDate
                        swCD = true
                    }
                } else {
                    if (cFuture < diffDaysClosingDate) {
                        cPast = diffDaysClosingDate
                        closingDatePast = period.closingDate
                    }
                }
            })
            let obj = {
                o: "",
                c: ""
            }
            obj = buildTooltipText(swOD ? openningDateFuture : openningDatePast, swCD ? closingDateFuture : closingDatePast);
            tooltipText = <div>
                <span><b>{t('Status')}</b>: {t(item.status)}</span> <br />
                <span><b>{t('Opening Date')}</b>: {obj.o}</span> <br />
                <span><b>{t('Closing Date')}</b>: {obj.c}</span> <br />
                <span><b>{t("Financing Modality")}</b>: {item.financingModality.map(i => t(i)).toString()}</span> <br />
                <span><b>{t("Mode of Participation")}</b>: {t(item.modalityParticipation)}</span>
            </div>
        }

        return tooltipText
    }

    const renderItem = (item: GrantBriefSummary, month: number, year: number) => {
        const days = getDays(year, month);
        return (
            item && item.periods && item.periods.filter(p => p.openningDate !== undefined).length > 0 ?
                <Row key={`${item.id} ${year} ${month}`}>{Array.from(Array(days).keys()).map(x => {
                    return <Tooltip key={`${item.id} ${year} ${month} ${x}`} title={item.status === "Closed" ? formaterDateClosed(item, x + 1, month, year) : formaterDate(item, x + 1, month, year)} color={'#00aeff'}>
                        <Col flex={1 / days} style={{
                            padding: '0px !important',
                            background: isActive(item.periods, x + 1, month, year) ? (
                                item.status === "Open" ? "rgb(0,0,164)" : item.status === "Closed" ? "#AD0274" : item.status === "PendingPublication" ? "#EFAC14" : undefined) :
                                undefined,
                            height: "20px"
                        }} className="calendar-day"></Col>
                    </Tooltip>
                })}</Row>
                :
                <Tooltip key={`${item.id} ${year} ${month}`} title={t('No Dates')} color={'#00aeff'}>
                    <Row><Col></Col></Row>
                </Tooltip>
        )
    }

    useEffect(() => {
        //let current = [
        //    {
        //        title: <><LeftOutlined
        //            onClick={() => {
        //                if (yearMin === null || (currentYearMin - 1 >= yearMin)) {
        //                    setCurrentYearMin(currentYearMin - 1)
        //                    setCurrentYearMax(currentYearMin - 1)
        //                }
        //            }} style={{ fontSize: "30px", float: "left" }} />
        //            <span> <CalendarOutlined />  {t('Calendar')}</span>
        //            <RightOutlined
        //                onClick={() => {
        //                    if (yearMax === null || (currentYearMin + 1 <= yearMax)) {
        //                        setCurrentYearMin(currentYearMin + 1)
        //                        setCurrentYearMax(currentYearMin + 1)
        //                    }
        //                }} style={{ fontSize: "30px", float: "right" }} /></>,
        //        dataIndex: 'name',
        //        key: 'name',
        //        width: 630,
        //        className: 'calendar-header',
        //        fixed: "left",
        //        render: (text, item, index) => <span style={{ whiteSpace: 'nowrap' }}>
        //            <Link className={'calendar-grant-title'} to={`/search/${item.id}`}>
        //                {GetCountryFlag(item.countryId, props.userProfile.countries)}
        //                <Tooltip title={item.title}>
        //                    <span style={{ marginLeft: 5 }}>{putLengthLimitToText(item.title, 100)}</span>
        //                </Tooltip>
        //            </Link>
        //        </span>
        //    }
        //];

        //const monthsRealOrder = ["", t("JAN"), t("FEB"), t("MAR"), t("APR"), t("MAY"), t("JUN"), t("JUL"), t("AUG"), t("SET"), t("OCT"), t("NOV"), t("DEC")]
        //const months = [""]
        //const monthsNumbersYear = [{ m: 0, y: 0 }]
        //for (let i = firstMonth ?? 1; i < 13; i++) {
        //    months.push(monthsRealOrder[i]);
        //    monthsNumbersYear.push({ m: i, y: currentYearMin });
        //}
        //for (let i = 1; i < firstMonth ?? 1; i++) {
        //    months.push(monthsRealOrder[i]);
        //    monthsNumbersYear.push({ m: i, y: currentYearMin + 1 });
        //}
        //const multipleYears = months[1] !== t("JAN");

        //let yearColumn = {
        //    title: multipleYears ? `${currentYearMin} - ${currentYearMin + 1}` : currentYearMin + "",
        //    dataIndex: currentYearMin + "",
        //    key: currentYearMin + "",
        //    className: 'calendar-year',
        //    children: []
        //};
        //yearColumn.children.push({
        //    title: <LeftOutlined onClick={() => {
        //        if (firstMonth === 1 || firstMonth === null) {
        //            if (yearMin === null || (currentYearMin - 1 >= yearMin)) {
        //                setCurrentYearMin(currentYearMin - 1);
        //                setCurrentYearMax(currentYearMin - 1);
        //                setFirstMonth(12);
        //            }
        //        }
        //        else {
        //            setFirstMonth(firstMonth - 1);
        //        }
        //    }} style={{ fontSize: "30px", float: "left" }} />,
        //    dataIndex: 'leftArrow',
        //    key: 'leftArrow',
        //    className: 'calendar-month',
        //    render: "",
        //    width: 50
        //})

        //for (let j = 1; j < 13; j++) {
        //    yearColumn.children.push(
        //        {
        //            title: months[j],
        //            dataIndex: months[j],
        //            key: currentYearMin + months[j],
        //            className: multipleYears && monthsNumbersYear[j].m === 1 ? 'calendarborder-month' : 'calendar-month',
        //            render: (text, item, index) => renderItem(item, monthsNumbersYear[j].m, monthsNumbersYear[j].y) as any
        //        }
        //    )
        //}

        //yearColumn.children.push({
        //    title: <RightOutlined onClick={() => {
        //        if (firstMonth === 12) {
        //            if (yearMax === null || (currentYearMin + 1 <= yearMax)) {
        //                setCurrentYearMin(currentYearMin + 1)
        //                setCurrentYearMax(currentYearMin + 1)
        //                setFirstMonth(1);
        //            }
        //        }
        //        else if (firstMonth === 1 || firstMonth === null) {
        //            if (yearMax === null || (currentYearMin + 1 <= yearMax)) {
        //                setFirstMonth(2);
        //            }
        //        }
        //        else {
        //            setFirstMonth((firstMonth ?? 1) + 1);
        //        }
        //    }} style={{ fontSize: "30px", float: "right" }} />,
        //    dataIndex: 'leftArrow',
        //    key: 'leftArrow',
        //    className: 'calendar-month',
        //    render: "",
        //    width: 50
        //})

        //current.push(yearColumn as any);
        const current = buildColumns();
        setColumns(current as any);
        const columnsPdf = buildColumns();
        setColumnsPdf(columnsPdf as any);
    }, [currentYearMin, currentYearMax, firstMonth]) // eslint-disable-line react-hooks/exhaustive-deps

    const buildColumns = () => {
        let current = [
            {
                title: <><LeftOutlined
                    onClick={() => {
                        if (yearMin === null || (currentYearMin - 1 >= yearMin)) {
                            setCurrentYearMin(currentYearMin - 1)
                            setCurrentYearMax(currentYearMin - 1)
                        }
                    }} style={{ fontSize: "30px", float: "left" }} />
                    <span> <CalendarOutlined />  {t('Calendar')}</span>
                    <RightOutlined
                        onClick={() => {
                            if (yearMax === null || (currentYearMin + 1 <= yearMax)) {
                                setCurrentYearMin(currentYearMin + 1)
                                setCurrentYearMax(currentYearMin + 1)
                            }
                        }} style={{ fontSize: "30px", float: "right" }} /></>,
                dataIndex: 'name',
                key: 'name',
                width: 630,
                className: 'calendar-header',
                fixed: "left",
                render: (text, item, index) => <span style={{ whiteSpace: 'nowrap' }}>
                    <Link className={'calendar-grant-title'} to={`/search/${item.id}`}>
                        {GetCountryFlag(item.countryId, props.userProfile.countries)}
                        <Tooltip title={item.title}>
                            <span style={{ marginLeft: 5 }}>{putLengthLimitToText(item.title, 100)}</span>
                        </Tooltip>
                    </Link>
                </span>
            }
        ];

        const monthsRealOrder = ["", t("JAN"), t("FEB"), t("MAR"), t("APR"), t("MAY"), t("JUN"), t("JUL"), t("AUG"), t("SET"), t("OCT"), t("NOV"), t("DEC")]
        const months = [""]
        const monthsNumbersYear = [{ m: 0, y: 0 }]
        for (let i = firstMonth ?? 1; i < 13; i++) {
            months.push(monthsRealOrder[i]);
            monthsNumbersYear.push({ m: i, y: currentYearMin });
        }
        for (let i = 1; i < firstMonth ?? 1; i++) {
            months.push(monthsRealOrder[i]);
            monthsNumbersYear.push({ m: i, y: currentYearMin + 1 });
        }
        const multipleYears = months[1] !== t("JAN");

        let yearColumn = {
            title: multipleYears ? `${currentYearMin} - ${currentYearMin + 1}` : currentYearMin + "",
            dataIndex: currentYearMin + "",
            key: currentYearMin + "",
            className: 'calendar-year',
            children: []
        };
        yearColumn.children.push({
            title: <LeftOutlined onClick={() => {
                if (firstMonth === 1 || firstMonth === null) {
                    if (yearMin === null || (currentYearMin - 1 >= yearMin)) {
                        setCurrentYearMin(currentYearMin - 1);
                        setCurrentYearMax(currentYearMin - 1);
                        setFirstMonth(12);
                    }
                }
                else {
                    setFirstMonth(firstMonth - 1);
                }
            }} style={{ fontSize: "30px", float: "left" }} />,
            dataIndex: 'leftArrow',
            key: 'leftArrow',
            className: 'calendar-month',
            render: "",
            width: 50
        })

        for (let j = 1; j < 13; j++) {
            yearColumn.children.push(
                {
                    title: months[j],
                    dataIndex: months[j],
                    key: currentYearMin + months[j],
                    className: multipleYears && monthsNumbersYear[j].m === 1 ? 'calendarborder-month' : 'calendar-month',
                    render: (text, item, index) => renderItem(item, monthsNumbersYear[j].m, monthsNumbersYear[j].y) as any
                }
            )
        }

        yearColumn.children.push({
            title: <RightOutlined onClick={() => {
                if (firstMonth === 12) {
                    if (yearMax === null || (currentYearMin + 1 <= yearMax)) {
                        setCurrentYearMin(currentYearMin + 1)
                        setCurrentYearMax(currentYearMin + 1)
                        setFirstMonth(1);
                    }
                }
                else if (firstMonth === 1 || firstMonth === null) {
                    if (yearMax === null || (currentYearMin + 1 <= yearMax)) {
                        setFirstMonth(2);
                    }
                }
                else {
                    setFirstMonth((firstMonth ?? 1) + 1);
                }
            }} style={{ fontSize: "30px", float: "right" }} />,
            dataIndex: 'leftArrow',
            key: 'leftArrow',
            className: 'calendar-month',
            render: "",
            width: 50
        })
        current.push(yearColumn as any);
        return current;
    }

    const rowSelection = {
        selectedRowKeys: selectedRows.map(r => r.id),
        preserveSelectedRowKeys: true,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows)
        },
    };

    return (
        <>
            
            <Table rowKey={"id"} rowSelection={rowSelection} columns={columns} dataSource={props.grants} pagination={false} />
        </>

    )
}

export default withTranslation()(withUserProfile(Calendar))
