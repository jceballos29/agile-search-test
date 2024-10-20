import { Card } from 'antd';
import React from 'react';
import { WithTranslation } from 'react-i18next';

interface FilterComponentProps extends WithTranslation {
  value: any;
  onChange: (value: any) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = (props) => {
  const onValueChanged = (value: any) => {
    props.onChange(value?.length === 0 ? undefined : value);
  };

  const onClearFilter = () => {
    props.onChange(undefined);
  };

  const { t } = props;

  if (!props.children) return <Card>{t('filter not configured')}</Card>;

  return (
    <Card style={{ minWidth: 320 }}>
      {React.cloneElement(props.children as any, { value: props.value, onChange: onValueChanged })}
      {props.value && (
        <a style={{ float: 'right', marginTop: 10 }} onClick={onClearFilter}>
          {t('Clear filter')}
        </a>
      )}
    </Card>
  );
};

export { FilterComponent };
