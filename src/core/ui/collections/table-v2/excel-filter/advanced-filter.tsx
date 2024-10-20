import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Select, Input, Radio, DatePicker, InputNumber } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next';
import Moment from 'moment';

export enum FilterDataType {
  Text = 'Text',
  Number = 'Number',
  Date = 'Date',
}

export interface FilterOp {
  id: number;
  label: string;
  op: string;
  negate?: boolean;
  allowNull?: boolean;
  func?: boolean;
}

const options: { [key: string]: FilterOp[] } = {
  [FilterDataType.Text]: [
    { id: 1, label: 'equals', op: 'eq' },
    { id: 2, label: 'does not equal', op: 'ne' },
    { id: 3, label: 'begins with', op: 'startswith', func: true },
    { id: 4, label: 'does not begin with', op: 'startswith', negate: true, allowNull: false, func: true },
    { id: 5, label: 'ends with', op: 'endswith', allowNull: false, func: true },
    { id: 6, label: 'does not end with', op: 'endswith', negate: true, allowNull: false, func: true },
    { id: 7, label: 'contains', op: 'contains', allowNull: false, func: true },
    { id: 8, label: 'does not contain', op: 'contains', negate: true, allowNull: false, func: true },
    { id: 9, label: 'is greater than', op: 'gt', allowNull: false },
    { id: 10, label: 'is greater or equals than', op: 'ge', allowNull: false },
    { id: 11, label: 'is less than', op: 'lt', allowNull: false },
    { id: 12, label: 'is less or equals than', op: 'le', allowNull: false },
  ],
  [FilterDataType.Number]: [
    { id: 1, label: 'equals', op: 'eq' },
    { id: 2, label: 'does not equal', op: 'ne' },
    { id: 3, label: 'is greater than', op: 'gt', allowNull: false },
    { id: 4, label: 'is greater or equals than', op: 'ge', allowNull: false },
    { id: 5, label: 'is less than', op: 'lt', allowNull: false },
    { id: 6, label: 'is less or equals than', op: 'le', allowNull: false },
  ],
  [FilterDataType.Date]: [
    { id: 1, label: 'equals', op: 'eq' },
    { id: 2, label: 'does not equal', op: 'ne' },
    { id: 3, label: 'is after', op: 'gt', allowNull: false },
    { id: 4, label: 'is after or equals than', op: 'ge', allowNull: false },
    { id: 5, label: 'is before than', op: 'lt', allowNull: false },
    { id: 6, label: 'is before or equals than', op: 'le', allowNull: false },
  ],
};

export interface AdvancedFilterValue {
  logicalOp?: 'and' | 'or';
  leftOp?: FilterOp;
  leftValue?: string | number;
  rightOp?: FilterOp;
  rightValue?: string | number;
}

export interface NumberExtras {
  decimalSeparator: string;
  max: number;
  min: number;
  precision: number;
  step: number;
  stringMode: boolean;
}

export interface CollectionExtras {
  collectionField: string;
  collectionOperator: 'any' | 'all' | 'user-select';
  collectionFieldTitle?: string;
}

export interface DateExtras {
  showTime: boolean;
  defaultTimeOfDay: { hour?: number; minute?: number; second?: number; milliseconds?: number };
  useLeftStartOfDay: boolean;
  useLeftEndOfDay: boolean;
  useRightStartOfDay: boolean;
  useRightEndOfDay: boolean;
  useLocalTimeZone: boolean;
  pickerType: 'week' | 'month' | 'quarter' | 'year';
  format: string;
  useDateString: boolean;
}

export interface TextExtras {
  isGuid: boolean;
}

export interface AdvancedFilterProps extends WithTranslation {
  field: string;
  fieldTitle: string;
  dataType: FilterDataType;
  value?: AdvancedFilterValue;
  onChange: (next: { value: AdvancedFilterValue; isValid: boolean; filter: any; collectionOp?: 'any' | 'all' }) => void;
  nullable?: boolean;
  textExtras?: Partial<TextExtras>;
  numberExtras?: Partial<NumberExtras>;
  dateExtras?: Partial<DateExtras>;
  collectionExtras?: Partial<CollectionExtras>;
  customLeftComponent?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  customRightComponent?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  allowedOperators?: (ops: FilterOp[]) => FilterOp[];
  collectionOperator?: 'all' | 'any';
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  field,
  value,
  onChange,
  dataType,
  t,
  fieldTitle,
  nullable = true,
  numberExtras,
  dateExtras,
  textExtras,
  customLeftComponent,
  customRightComponent,
  allowedOperators,
  collectionExtras,
  collectionOperator,
}) => {
  const [current, setCurrent] = useState<AdvancedFilterValue>(value || { logicalOp: 'and', leftOp: { id: 1, label: 'equals', op: 'eq' } });

  const [collectionOp, setCollectionOp] = useState<'any' | 'all'>(
    collectionOperator ||
      (['all', 'any'].includes(collectionExtras?.collectionOperator as any) ? (collectionExtras?.collectionOperator as any) : 'any')
  );
  const inputRef = useRef<any>();

  useEffect(() => {
    if (inputRef?.current != null) inputRef.current.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const equals = (x: AdvancedFilterValue, y: AdvancedFilterValue) => {
    if (x == null && y == null) return true;
    if ((x == null) != (y == null)) return false;
    return (
      x.leftOp?.id === y.leftOp?.id &&
      x.leftValue === y.leftValue &&
      x.logicalOp === y.logicalOp &&
      x.rightOp?.id === y.rightOp?.id &&
      x.rightValue === y.rightValue
    );
  };

  useEffect(() => {
    if (!equals(value, current)) setCurrent(value || { logicalOp: 'and', leftOp: { id: 1, label: 'equals', op: 'eq' } });
    if (collectionOp !== collectionOperator) setCollectionOp(collectionOperator);
  }, [value, collectionOperator]); // eslint-disable-line react-hooks/exhaustive-deps

  const isComplete = (value: AdvancedFilterValue) => {
    if (value == null) return false;
    if (collectionExtras != null && collectionOp == null) return false;
    return value.leftOp != null || value.rightOp != null;
  };

  const getValueObject = (x: any) => {
    if (dataType === FilterDataType.Date) {
      if (x == null) return null;
      return { value: encodeURIComponent(x), type: 'raw' };
    }
    if (dataType === FilterDataType.Number && typeof x === 'string') {
      return { value: encodeURIComponent(x), type: 'raw' };
    }
    if (dataType === FilterDataType.Text && !!textExtras?.isGuid) {
      return { value: encodeURIComponent(x), type: 'raw' };
    }
    if (dataType === FilterDataType.Text && x == null) {
      return null;
    }
    return x;
  };

  const generateFilterObject = (val: AdvancedFilterValue) => {
    let final = undefined;
    if (val != null) {
      const parts = [];
      if (val.leftOp != null) {
        if (val.leftOp.func && val.leftOp.negate && collectionExtras != null) {
          // PATCH see https://github.com/techniq/odata-query/issues/98
          let f: any = { [`${val.leftOp.op}(${field}, '${encodeURIComponent(val.leftValue)}')`]: false };
          parts.push(f);
        } else {
          let f: any = { [field]: { [val.leftOp.op]: getValueObject(val.leftValue) } };
          if (val.leftOp.negate) f = { not: f };
          parts.push(f);
        }
      }
      if (val.rightOp != null) {
        if (val.rightOp.func && val.rightOp.negate && collectionExtras != null) {
          // PATCH see https://github.com/techniq/odata-query/issues/98
          let f: any = { [`${val.rightOp.op}(${field}, '${encodeURIComponent(val.rightValue)}')`]: false };
          parts.push(f);
        } else {
          let f: any = { [field]: { [val.rightOp.op]: getValueObject(val.rightValue) } };
          if (val.rightOp.negate) f = { not: f };
          parts.push(f);
        }
      }
      if (parts.length !== 0) {
        let f = parts[0];
        if (parts.length === 2) f = { [val.logicalOp || 'and']: [parts[0], parts[1]] };

        final = final ? { and: [final, f] } : f;
      }
    }
    return final;
  };

  useEffect(() => {
    const isValid = isComplete(current) && validate(current);
    const next = {
      value: current,
      isValid,
      filter: isValid ? generateFilterObject(current) : undefined,
      collectionOp,
    };
    onChange(next);
  }, [current, collectionOp]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyDateOptions = (value: Moment.Moment, left: boolean = true) => {
    if (value == null || dateExtras == null) return value;
    const { defaultTimeOfDay, useLeftStartOfDay, useLeftEndOfDay, useRightStartOfDay, useRightEndOfDay, useLocalTimeZone } = dateExtras;
    if (!useLocalTimeZone) {
      value = Moment.utc(value);
    }
    if (defaultTimeOfDay != null) {
      value.set(defaultTimeOfDay);
    } else if (left) {
      if (useLeftStartOfDay) value.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      else if (useLeftEndOfDay) value.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    } else {
      if (useRightStartOfDay) value.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      else if (useRightEndOfDay) value.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    }
    return value;
  };

  const validate = (current: AdvancedFilterValue) => {
    if (current == null || (current.leftOp == null && current.rightOp == null)) {
      return false;
    } else {
      if (current.leftOp != null && current.leftValue == null && (nullable === false || current.leftOp.allowNull === false)) {
        return false;
      }
      if (current.rightOp != null && current.rightValue == null && (nullable === false || current.rightOp.allowNull === false)) {
        return false;
      }
    }
    return true;
  };

  let opts = options[dataType];
  if (dataType === FilterDataType.Text && textExtras?.isGuid) {
    opts = opts.slice(0, 2);
  }

  if (allowedOperators) opts = allowedOperators(opts);

  return (
    <div className="advanced-filter-container">
      <Row gutter={[8, 8]} style={{ marginBottom: 20 }}>
        <Col>
          {collectionExtras == null ? (
            <>
              {t('Show rows where')} {fieldTitle}:
            </>
          ) : collectionExtras.collectionOperator === 'user-select' ? (
            <>
              {t('Show rows where')}{' '}
              <Select
                dropdownMatchSelectWidth={false}
                allowClear={false}
                style={{ width: '98px' }}
                value={collectionOp}
                options={[
                  { label: t('some'), value: 'any' },
                  { label: t('every'), value: 'all' },
                ]}
                onChange={setCollectionOp}
              />{' '}
              {collectionExtras?.collectionFieldTitle || fieldTitle}:
            </>
          ) : (
            <>
              {t('Show rows where')} <u>{t(collectionExtras.collectionOperator)}</u> {collectionExtras?.collectionFieldTitle || fieldTitle}:
            </>
          )}
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={10}>
          <Select
            dropdownMatchSelectWidth={false}
            allowClear
            onClear={() =>
              setCurrent((c) => {
                c.leftOp = null;
                c.leftValue = null;
                return { ...c };
              })
            }
            style={{ width: '100%' }}
            value={current?.leftOp?.id}
            options={opts.map((x) => ({ label: t(x.label), value: x.id }))}
            onChange={(v) => {
              setCurrent((c) => {
                c.leftOp = opts[v - 1];
                return { ...c };
              });
            }}
          />
        </Col>
        <Col span={14}>
          {customLeftComponent ? (
            customLeftComponent(current?.leftValue, (v) => {
              setCurrent((c) => {
                c.leftValue = v;
                return { ...c };
              });
            })
          ) : (
            <>
              {dataType === FilterDataType.Text && (
                <Input
                  ref={inputRef}
                  allowClear={!!nullable}
                  style={{ width: '100%' }}
                  className="normal-text-input"
                  value={(current?.leftValue as string) || ''}
                  onChange={(e) => {
                    setCurrent((c) => {
                      c.leftValue = e.type === 'change' ? e.target.value : null;
                      return { ...c };
                    });
                  }}
                />
              )}
              {dataType === FilterDataType.Date && (
                <DatePicker
                  ref={inputRef}
                  style={{ width: '100%' }}
                  popupStyle={{ zIndex: 2051 }}
                  value={current?.leftValue && Moment(current?.leftValue)}
                  onChange={(v, str) => {
                    setCurrent((c) => {
                      if (dateExtras?.useDateString) c.leftValue = str;
                      else c.leftValue = applyDateOptions(v, true)?.toISOString();
                      return { ...c };
                    });
                  }}
                  showTime={dateExtras?.showTime}
                  allowClear={!!nullable}
                  format={dateExtras?.format}
                  {...({ picker: dateExtras?.pickerType } as any)}
                />
              )}
              {dataType === FilterDataType.Number && (
                <InputNumber
                  ref={inputRef}
                  style={{ width: '100%' }}
                  className="normal-text-input"
                  value={(current?.leftValue as number) || undefined}
                  onChange={(v) => {
                    setCurrent((c) => {
                      c.leftValue = v;
                      return { ...c };
                    });
                  }}
                  {...numberExtras}
                />
              )}
            </>
          )}
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 15, marginBottom: 15 }}>
        <Col>
          <Radio.Group
            onChange={(e) => {
              setCurrent((c) => {
                c.logicalOp = e.target.value;
                return { ...c };
              });
            }}
            value={current?.logicalOp || 'and'}
          >
            <Radio value={'and'}>{t('And')}</Radio>
            <Radio value={'or'}>{t('Or')}</Radio>
          </Radio.Group>
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={10}>
          <Select
            allowClear
            onClear={() =>
              setCurrent((c) => {
                c.rightOp = null;
                c.rightValue = null;
                return { ...c };
              })
            }
            dropdownMatchSelectWidth={false}
            style={{ width: '100%' }}
            value={current?.rightOp?.id}
            options={opts.map((x) => ({ label: t(x.label), value: x.id }))}
            onChange={(v) => {
              setCurrent((c) => {
                c.rightOp = opts[v - 1];
                return { ...c };
              });
            }}
          />
        </Col>
        <Col span={14}>
          {customRightComponent ? (
            customRightComponent(current?.rightValue, (v) => {
              setCurrent((c) => {
                c.rightValue = v;
                return { ...c };
              });
            })
          ) : (
            <>
              {dataType === FilterDataType.Text && (
                <Input
                  allowClear={!!nullable}
                  style={{ width: '100%' }}
                  className="normal-text-input"
                  value={(current?.rightValue as string) || ''}
                  onChange={(e) => {
                    setCurrent((c) => {
                      c.rightValue = e.type === 'change' ? e.target.value : null;
                      return { ...c };
                    });
                  }}
                />
              )}
              {dataType === FilterDataType.Date && (
                <DatePicker
                  style={{ width: '100%' }}
                  popupStyle={{ zIndex: 2051 }}
                  value={current?.rightValue && Moment(current?.rightValue)}
                  onChange={(v, str) => {
                    setCurrent((c) => {
                      if (dateExtras?.useDateString) c.rightValue = str;
                      else c.rightValue = applyDateOptions(v, false)?.toISOString();
                      return { ...c };
                    });
                  }}
                  showTime={dateExtras?.showTime}
                  format={dateExtras?.format}
                  allowClear={!!nullable}
                  {...({ picker: dateExtras?.pickerType } as any)}
                />
              )}
              {dataType === FilterDataType.Number && (
                <InputNumber
                  style={{ width: '100%' }}
                  className="normal-text-input"
                  value={(current?.rightValue as number) || undefined}
                  onChange={(v) => {
                    setCurrent((c) => {
                      c.rightValue = v;
                      return { ...c };
                    });
                  }}
                  {...numberExtras}
                />
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default withTranslation()(AdvancedFilter);
