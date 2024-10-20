import { Tooltip } from 'antd';
import { FC, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface CalendarRenderProps extends WithTranslation {
    firstItem: number;
    lastItem: number;
    arrayDates: any;
    openningDate: any;
    closingDate: any;
    initValue: number;
}

const CalendarRender: FC<CalendarRenderProps> = (props) => {
    const { firstItem, lastItem, arrayDates, openningDate, closingDate, initValue } = props;

    const [aux, setAux] = useState(initValue)

    const formaterDate = () => {
        let _date = (openningDate).toString().split("-")
        let _year = _date[0]
        let _month = _date[1]
        let _day = _date[2].substring(0, 2)

        let date_ = (closingDate).toString().split("-")
        let year_ = date_[0]
        let month_ = date_[1]
        let day_ = date_[2].substring(0, 2)
        return `${_day}-${_month}-${_year} / ${day_}-${month_}-${year_}`
    }

    return (
        <>
            <div className="block-2021">
                {firstItem == (aux) && lastItem == (aux) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 1) && lastItem == (aux + 1) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 1) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 1) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 1] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 2) && lastItem == (aux + 2) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 2) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 2) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 2] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 3) && lastItem == (aux + 3) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 3) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 3) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 3] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 4) && lastItem == (aux + 4) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 4) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 4) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 4] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 5) && lastItem == (aux + 5) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 5) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 5) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 5] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 6) && lastItem == (aux + 6) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 6) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 6) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 6] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 7) && lastItem == (aux + 7) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 7) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 7) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 7] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 8) && lastItem == (aux + 8) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 8) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 8) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 8] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 9) && lastItem == (aux + 9) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 9) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 9) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 9] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 10) && lastItem == (aux + 10) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 10) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 10) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 10] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
                {firstItem == (aux + 11) && lastItem == (aux + 11) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="uni-sel"></p> </Tooltip> : firstItem == (aux + 11) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="first-sel"></p> </Tooltip> : lastItem == (aux + 11) ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="last-sel"></p> </Tooltip> : arrayDates[aux + 11] ? <Tooltip title={formaterDate()} color={'#00aeff'}> <p className="item-sel"></p> </Tooltip> : <p className="item-normal"> </p>}
            </div>
        </>
    )
};

export default withTranslation()(CalendarRender);