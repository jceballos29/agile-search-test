import { Button, Card, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select, Popconfirm } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { container } from 'src/inversify.config';
import { GrantSummary } from 'src/stores/grant-store';
import HttpService from '../../../core/services/http.service';
import { IdentityProps, withIdentity } from '../../../core/services/authentication';
import './grant-calendar-style.less';
import CalendarRender from './calendar-render'
import useWindowSize from 'src/utils/hooks/useWindowSize';
import { cutNumber } from 'src/utils/helpers';

interface GrantCalendarItemProps extends WithTranslation, RouteComponentProps, IdentityProps {
    item: GrantSummary;
}

const GrantCalendarItem: FC<GrantCalendarItemProps> = (props) => {
    const { t, item } = props;
    const s = useWindowSize()
    const [arrayDates, setArrayDates] = useState([])
    const [firstItem, setFirstItem] = useState(0)
    const [lastItem, setLastItem] = useState(0)

    useEffect(() => {
        if (item.closingDate && item.openningDate) {

            let fullDate = (item.openningDate)?.toString().split("-")
            let yearInit = parseInt(fullDate[0])
            let monthInit = parseInt(fullDate[1])

            if (yearInit == 2021) {
                for (let k = 1; k <= 12; k++) {
                    if (monthInit > k) { arrayDates.push(false) }
                    else { arrayDates.push(true) }
                }
                for (let j = 0; j < 36; j++) {
                    arrayDates.push(true)
                }
            }
            if (yearInit == 2022) {
                for (let j = 0; j < 12; j++) {
                    arrayDates.push(false)
                }
                for (let k = 1; k <= 12; k++) {
                    if (monthInit > k) { arrayDates.push(false) }
                    else { arrayDates.push(true) }
                }
                for (let j = 0; j < 24; j++) {
                    arrayDates.push(true)
                }
            }
            if (yearInit == 2023) {
                for (let j = 0; j < 12; j++) {
                    arrayDates.push(false)
                }
                for (let j = 0; j < 12; j++) {
                    arrayDates.push(false)
                }

                for (let k = 1; k <= 12; k++) {
                    if (monthInit > k) { arrayDates.push(false) }
                    else { arrayDates.push(true) }
                }
                for (let j = 0; j < 12; j++) {
                    arrayDates.push(true)
                }
            }
            if (yearInit == 2024) {
                for (let j = 0; j < 36; j++) {
                    arrayDates.push(false)
                }
                for (let k = 1; k <= 12; k++) {
                    if (monthInit > k) { arrayDates.push(false) }
                    else { arrayDates.push(true) }
                }
            }


            let dateFinal = (item.closingDate).toString().split("-")
            let yearFinal = parseInt(dateFinal[0])
            let monthFinal = parseInt(dateFinal[1])

            if (yearFinal == 2021) {
                for (let k = 0; k < 12; k++) {
                    if (monthFinal <= k) { arrayDates.splice(k, 1, false) }
                }
                for (let k = 0; k < 36; k++) {
                    arrayDates.splice(k + 12, 1, false)
                }
            }
            if (yearFinal == 2022) {
                for (let k = 0; k < 12; k++) {
                    if (monthFinal <= k) { arrayDates.splice(k + 12, 1, false) }
                }
                for (let k = 0; k < 24; k++) {
                    arrayDates.splice(k + 24, 1, false)
                }
            }
            if (yearFinal == 2023) {
                for (let k = 0; k < 12; k++) {
                    if (monthFinal <= k) { arrayDates.splice(k + 24, 1, false) }
                }
                for (let k = 0; k < 24; k++) {
                    arrayDates.splice(k + 36, 1, false)
                }
            }
            if (yearFinal == 2024) {
                for (let k = 0; k < 12; k++) {
                    if (monthFinal <= k) { arrayDates.splice(k + 36, 1, false) }
                }
            }

            setTimeout(function () {
                const selectTrue = (element) => element == true
                setFirstItem(arrayDates.findIndex(selectTrue))
                setLastItem(arrayDates.lastIndexOf(true))
            }, 1000);
        }
    }, []);


    return (
        <>
            {item.openningDate && item.closingDate &&

                <>
                    <div className="calendar-info">
                        <Link className={'fi-light-blue-color'} to={`/search/${item.id}`}>
                            <Tooltip title={item.title}>{item.title.slice(0, cutNumber(0.5, s)) + (item.title.length > cutNumber(0.5, s) ? '...' : '')}</Tooltip>
                        </Link>
                    </div>

                    <div className="calendar-date">


                        <CalendarRender
                            firstItem={firstItem}
                            lastItem={lastItem}
                            arrayDates={arrayDates}
                            openningDate={item.openningDate}
                            closingDate={item.closingDate}
                            initValue={0}
                        />

                        <CalendarRender
                            firstItem={firstItem}
                            lastItem={lastItem}
                            arrayDates={arrayDates}
                            openningDate={item.openningDate}
                            closingDate={item.closingDate}
                            initValue={12}
                        />

                        <CalendarRender
                            firstItem={firstItem}
                            lastItem={lastItem}
                            arrayDates={arrayDates}
                            openningDate={item.openningDate}
                            closingDate={item.closingDate}
                            initValue={24}
                        />

                        <CalendarRender
                            firstItem={firstItem}
                            lastItem={lastItem}
                            arrayDates={arrayDates}
                            openningDate={item.openningDate}
                            closingDate={item.closingDate}
                            initValue={36}
                        />


                    </div>

                </>
            }
        </>
    );
};

export default withIdentity(withTranslation()(withRouter(GrantCalendarItem)));
