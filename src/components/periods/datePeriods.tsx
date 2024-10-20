
import { FC, useEffect, useReducer, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { UserProfileProps, withUserProfile } from '../user-profile'
import { Period } from 'src/pages/admin/publication-control/grants-edit/grant-edit'
import { DatePicker, Button, Row, Col } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import moment from 'moment'

interface PeriodsProps extends WithTranslation, UserProfileProps {
  value?: Period[]
  onChange?: (values: Period[]) => void
}

const { RangePicker } = DatePicker;

const Periods: FC<PeriodsProps> = (props) => {
  const { t, value, onChange } = props;

  const dateFormat = 'YYYY/MM/DD';
  const [periods, setPeriods] = useState<Period[]>(value);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    if (value) setPeriods(value)
  }, [value])

  const updateDate = (date: any, isOpen: boolean, index: number) => {
    var newPeriods = periods
    isOpen ? newPeriods[index].openningDate = date
      :
      newPeriods[index].closingDate = date
    setPeriods(newPeriods)
    onChange && onChange(newPeriods)
    forceUpdate()
  }

  const removePeriod = (index: number) => {
    let newPeriods = periods
    newPeriods.splice(index, 1)
    setPeriods(newPeriods)
    onChange && onChange(newPeriods)
    forceUpdate()
  }

  const addPeriod = () => {
    let lastDay: Date;
    if (periods && periods.length > 0) {
      lastDay = periods[periods.length - 1].closingDate;
    } else {
      lastDay = moment().toDate();
    }

    const item: Period = {
      openningDate: moment(lastDay).add(1, 'days').toDate(),
      closingDate: moment(lastDay).add(2, 'days').toDate()
    };

    let newPeriods = periods
    if (periods) {
      newPeriods?.push(item)
      setPeriods(newPeriods)
    } else {
      setPeriods([item])
    }
    if (props.onChange) props.onChange(newPeriods)
    forceUpdate()
  }

  const disabledStartDate: RangePickerProps['disabledDate'] = (current) => {
    if (currentPosition === 0) {
      return current && current >= moment(periods[0].closingDate);
    } else {
      return current && (current <= moment(periods[currentPosition - 1].closingDate) || current >= moment(periods[currentPosition].closingDate));
    }
  };

  const disabledEndDate: RangePickerProps['disabledDate'] = (current) => {
    if (currentPosition === periods.length - 1) {
      return current && current <= moment(periods[currentPosition].openningDate);
    } else {
      return current && (current >= moment(periods[currentPosition + 1].openningDate) || current <= moment(periods[currentPosition].openningDate));
    }
  };

  function onChangeRangePicker(value, dateString, index) {
    var newPeriods = periods

    newPeriods[index].openningDate = !value ? null :dateString[0]
    newPeriods[index].closingDate = !value ? null : dateString[1]
    setPeriods(newPeriods)

    onChange && onChange(newPeriods)
    forceUpdate()
  }


   return (
    <>
      {
        periods?.map((period, index) => (
          <div className='all-periods'>
            <Row style={{ width: '100%', marginBottom: '10px' }}>
              <Col span={23}>
                <Row>
                  <Col span={12}> <label> <i className="fa-solid fa-lock-open"></i> {t('Opening Date')}</label></Col>
                  <Col span={10}> <label> <i className="fa-solid fa-lock"></i> {t('Closing Date')}</label></Col>
                </Row>
                <RangePicker
                  aria-required
                  style={{ width: '100%' }}
                  getPopupContainer={(triggerNode) => {
                    return triggerNode.parentNode as HTMLElement
                  }}

                  defaultValue={[
                      period.openningDate ? moment(period.openningDate) :  null,
                      period.closingDate ? moment(period.closingDate) : null
                      ]}

                  format={dateFormat}
                  placeholder={[t('Opening Date'), t('Closing Date')]}
                  onChange={(value, dateString) => onChangeRangePicker(value, dateString, index)}
                />
              </Col>

              <Col span={1}>
                <div className="item-edit-10 add-periods">
                  <CloseOutlined
                    style={{ color: 'red', fontSize: '20px', padding: '5px' }}
                    onClick={() => removePeriod(index)}
                  />
                </div>
              </Col>
            </Row>

          </div>
        ))

      }
      <Row style={{ marginTop: '15px' }}>
        <Col span={24} style={{alignItems: 'center'}}>
          <Button 
          type="dashed" 
          style={{width:200}}
          onClick={() => addPeriod()}>
            <i className="fa-solid fa-plus"></i> {t('Add Period')}
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default withTranslation()(withUserProfile(Periods))


