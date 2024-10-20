import React, { useEffect, useRef } from 'react';
import { Input } from 'antd';

export const TextFilter: React.FC<any> = (props: any) => {
  const inputRef = useRef<any>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ margin: '10px 20px 10px 20px' }}>
      <Input ref={inputRef} value={props.value} onChange={(e) => props.onChange(e?.target?.value ?? undefined)} />
    </div>
  );
};
