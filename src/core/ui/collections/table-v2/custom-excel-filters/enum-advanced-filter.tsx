import React, { useState } from 'react';
import { Col, Row, Select } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useEffect } from 'react';
import {CustomFilterComponentProps} from 'src/core/ui/collections/table-v2/excel-filter'
import {setEquals} from 'src/core/utils/set'


export interface EnumFilterModalProps extends WithTranslation, CustomFilterComponentProps {
  value: string[];
  fieldTitle: string;
  field: string;
  options: { label: string; value: string }[];
}

const EnumAdvancedFilter: React.FC<EnumFilterModalProps> = ({ t, field, fieldTitle, options, value, onChange }) => {
  const [selection, setSelection] = useState<any[]>(value || []);

  useEffect(() => {
    if (!setEquals(selection, value, (x,y) => x === y))
      setSelection(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateFilterObject = (next) => {
    let final = null;
    if (next.length === 0) {
      final = 'false';
    } else if (next.length === 1) {
      final = { [field]: { eq: next[0] } } as any;
    } else if (next.length !== options.length) {
      final = { or: next.map((x) => ({ [field]: { eq: x } })) } as any;
    }
    return final;
  }

  useEffect(() => {
    const next = {
        value: selection,
        isValid: selection != null,
        filter: generateFilterObject(selection),
    }
    onChange(next);
  }, [selection]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="advanced-filter-container">
      <Row gutter={[8, 8]} style={{ marginBottom: 20 }}>
        <Col>
          {t('Show rows where')} {fieldTitle} {t('is in')}:
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={24}>
          <Select
            dropdownMatchSelectWidth={false}
            allowClear
            onClear={() => {
              setSelection([]);
            }}
            style={{ width: '100%' }}
            value={selection}
            mode="multiple"
            options={options}
            onChange={(v) => {
              setSelection(v);
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default withTranslation()(EnumAdvancedFilter);
