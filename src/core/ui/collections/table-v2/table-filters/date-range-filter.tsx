import React, { useEffect, useRef } from 'react';
import { DatePicker } from 'antd';
import * as moment from 'moment';

const { RangePicker } = DatePicker;

type OdataDateFilter = { ge: { value: string; type: 'raw' }; le: { value: string; type: 'raw' } };

export const DateRangeFilter: React.FC<any> = (props: { onChange: (value: OdataDateFilter) => void; value: OdataDateFilter; allowClear?: boolean } & any) => {
  const inputRef = useRef<any>(null);

  const { value, onChange, allowClear } = props;

  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const toString = (value: string | Date | moment.Moment, momentOfDay?: 'startOfDay' | 'endOfDay') => {
    const momentObj = moment.utc(value);
    if (momentOfDay === 'startOfDay') momentObj.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    else if (momentOfDay === 'endOfDay') momentObj.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    return momentObj.toISOString();
  };

  return (
    <div style={{ margin: '10px 20px 10px 20px' }}>
      <RangePicker
        ref={inputRef}
        allowClear={Boolean(allowClear)}
        value={(value?.ge?.value && value?.le?.value ? [moment.utc(value.ge.value), moment.utc(value.le.value)] : undefined) as any}
        onChange={(dates) => {
          if (dates === null && Boolean(allowClear)) {
            onChange({
              ge: { value: undefined, type: 'raw' },
              le: { value: undefined, type: 'raw' }
            });
            return
          }
          if (dates != null && dates[0] != null && dates[1] != null) {
            onChange({
              ge: { value: toString(dates?.[0] as moment.Moment, 'startOfDay'), type: 'raw' },
              le: { value: toString(dates?.[1] as moment.Moment, 'endOfDay'), type: 'raw' }
            });
          }
        }}
      />
    </div>
  );
};
