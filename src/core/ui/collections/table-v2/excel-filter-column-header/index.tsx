import React, { useState, useEffect } from 'react';
import ExcelFilter, { ExcelFilterProps, FilterDataType, NumberExtras, DateExtras, TextExtras, CustomFilterComponentProps, FilterOp, AdvancedFilterValue } from '../excel-filter';
import { CaretDownOutlined, CaretUpOutlined, DownSquareOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { withTranslation } from 'react-i18next';

export type { NumberExtras, DateExtras, TextExtras, CustomFilterComponentProps, FilterOp, AdvancedFilterValue };
export { FilterDataType };

export interface ExcelFilterColumnHeaderProps extends ExcelFilterProps {
    style?: React.CSSProperties;
    customFilteredParameter?: string;
}

const ExcelFilterColumnHeader: React.FC<ExcelFilterColumnHeaderProps> = ({ style, customFilteredParameter, ...filterProps }) => {
  const {field, sortField=field, title, isFilterActive, isSortActive} = filterProps;
  const [visible, setVisibility] = useState(false);
  const [filterSession, setFilterSession] = useState(0);

  const query = filterProps.query;
  
  const filtered = isFilterActive?.(query) || query.filter?.[field] != null || query.odataObject?.filter?.[field] != null || (customFilteredParameter != null && query?.parameters?.[customFilteredParameter] != null)
  const sortDirection = isSortActive?.(query) || query.orderBy?.find((x) => x.field === sortField)?.direction;
  const sorted = sortDirection === 'Ascending' || sortDirection === 'Descending';
  
  const onExit = () => {
    setVisibility(false);
    filterProps?.onEnd?.();
  };

  useEffect(() => {
    if (visible)
      setFilterSession(x => x + 1);
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="excel-filter-column-header" style={{ ...style, display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: '1 1' }}>{title}</div>
      <div style={{ marginLeft: 5, width: 'max-content', cursor: 'pointer' }}>
        <Popover
          zIndex={2049}
          visible={visible}
          onVisibleChange={setVisibility}
          placement="bottomRight"
          overlayInnerStyle={{ padding: 0 }}
          content={<ExcelFilter {...filterProps} onEnd={onExit} customQueryParameter={customFilteredParameter} filterSession={filterSession} />}
          trigger="click"
        >
          <span>
            {!sorted && !filtered && <DownSquareOutlined />}
            {filtered && <FilterOutlined style={{ color: '#1890ff' }} />}
            {sortDirection === 'Ascending' && <CaretUpOutlined style={{ color: '#1890ff' }} />}
            {sortDirection === 'Descending' && <CaretDownOutlined style={{ color: '#1890ff' }} />}
          </span>
        </Popover>
      </div>
    </div>
  );
};

export default withTranslation()(ExcelFilterColumnHeader);
