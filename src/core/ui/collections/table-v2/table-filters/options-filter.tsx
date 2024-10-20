import React, { useEffect, useRef } from 'react';
import { Select } from 'antd';

export const OptionsFilter: React.FC<any> = (props: any) => {
  const inputRef = useRef<any>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ margin: '10px 20px 10px 20px' }}>
      <Select style={{ width: '100%' }} options={props.options || []} allowClear onChange={props.onChange} value={props.value} />
    </div>
  );
};
