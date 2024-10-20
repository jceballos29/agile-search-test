import * as React from 'react';
import { Select } from 'antd';
import '../../utils/linq';
import { QueryResult } from '../../stores/data-store';
import debounce from 'lodash.debounce';
import { FC, useCallback, useEffect, useState } from 'react';
const Option = Select.Option;

interface SelectionInputProps {
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
  nullable?: boolean;
  minWidth?: number;
  width?: number;
  //readonly?: boolean,
  content?: (item: any) => React.ReactElement<any>;
  transform?: (item: any) => { key: string, value: string, text: string }
  multiple?: boolean;
  searchQuery?: string;
  placeholder?: string;
  valueAsItemReference?: boolean,
  value: any | any[] | string | string[];
  onChange: (value: any | any[] | string | string[] | undefined) => void;
  onSelect?: (value: any | any[] | string | string[] | undefined) => void;
  options?: SelectionItem[];
  query?: (searchQuery: string, selectedValue: any) => Promise<QueryResult<any>>;
  hideText?: boolean;
  url?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  // onAdd: (item: ItemReference) => void,
  // onRemove: (item: ItemReference) => void
  dropdownRenderCustom?: (menu: React.ReactElement) => React.ReactElement;
  loading?: boolean;
}

export interface SelectionItem {
  key: string;
  text: string;
  value: string;
  object?: any;
}

const SelectionInput: FC<SelectionInputProps> = ({ minWidth, width, className, disabled, nullable, onSelect, content, multiple, searchable, placeholder, valueAsItemReference, hideText, query, value, onChange, transform, loading, ...props }) => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [firstFetch, setFirstFetch] = useState<boolean>(true);
  const [options, setOptions] = useState<SelectionItem[]>([]);
  const [cache, setCache] = useState<SelectionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!transform) {
    transform = (o: any) => {
      if (!o)
        return undefined;
      if (typeof o === 'object' && o !== undefined) {
        return {
          key: o.id,
          text: o.title,
          value: o.id,
          object: o
        }
      }
      return undefined
    };
  }

  useEffect(() => {
    if (valueAsItemReference) {
      if (Array.isArray(value)) {
        let items = value.filter(o => typeof o === 'object' && o !== undefined && o !== null).map(o => transform(o))
        setCache([...cache, ...items])
      } else {
        if (typeof value === 'object' && value !== undefined && value !== null && value !== null) {
          setCache([...cache, transform(value)])
        }
      }
    }
    if (typeof value === 'object' && value !== undefined && value !== null && (!options || options.length == 0)) {
      let opts = (Array.isArray(value)) ? value.map(o => transform(o)).filter(o => o) : [transform(value)].filter(o => o)
      if (opts && opts.length > 0) {
        setOptions(opts)
      } else {
        loadData();
      }
    } else {
      if (value && (!options || options.length == 0)) {
        loadData();
      }
    }
  }, [value])

  useEffect(() => {
    if (!value && firstFetch && !searchQuery) {
      setFirstFetch(false);
      return;
    }
    loadData();
  }, [searchQuery]);

  const loadData = async () => {
    await debouncedQuery(searchQuery, value);
  }

  const debouncedQuery = useCallback(
    debounce(async (searchQuery, value) => {
      try {
        setIsFetching(true);
        const qryResult = await query!(searchQuery, value) as any;
        const items = qryResult.items.map(o => transform(o)) as SelectionItem[];

        if (!multiple) {
          var itemReference = transform(value) || cache.firstOrDefault(c => c.key == value)?.object;
          if (itemReference && items.filter((o: any) => o.key == itemReference.key).length === 0) {
            items.push(itemReference)
          }
        }
        else {
          if (value) {
            var itemReferenceArray = value.map(o => transform(o) || cache.firstOrDefault(c => c.key == value)?.object).filter(o => o)
            itemReferenceArray.forEach(t => {
              if (t && items.filter((o: any) => o.key === t.key).length === 0) {
                items.push(t)
              }
            })
          }
        }
        let newOptions = (items || []).map((o: any) => addContent(o, o.object));
        setOptions(newOptions);
      } finally {
        setIsFetching(false);
      }
    }, 1000),
    [query]
  );

  const handleChange = (value: any) => {
    if (value === undefined || value === null) {
      if (nullable) {
        onChange(undefined)
      }
      return;
    }
    if (multiple) {
      onChange(valueAsItemReference ? options.filter(o => value.any(v => v == o.key)).map(o => o.object) : value);
    } else {
      const filteredOptions = options.filter((o) => o.value === value);
      if (filteredOptions.length > 0) {
        const item: any | string = filteredOptions[0].object || filteredOptions[0].value;
        onChange(valueAsItemReference ? options.firstOrDefault(o => o.key == value)?.object : value);
      }
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  }

  const addContent = (item: any, obj: any) => {
    item.searchableText = item.text;
    if (content) {
      item.text = content(obj);
    }
    return item;
  };

  const updateCache = (value: any) => {
    var obj = options.firstOrDefault(o => o.key == value);
    if (obj) {
      if (!cache.any(c => c.key == value)) {
        setCache([...cache, obj])
      }
    }
  }

  return <Select style={{ minWidth: minWidth, width: width || '100%' }}
    className={className}
    mode={multiple ? 'multiple' : undefined}
    disabled={disabled}
    allowClear={nullable}
    onClear={!nullable ? undefined : () => handleChange(null)}
    value={options.any() ? Array.isArray(value) ? value.map(o => transform(o)?.key || o).filter(o => o) : ((typeof value === 'object' && value !== undefined) ? (!value ? undefined : transform(value)?.key) : value)
      : undefined}
    placeholder={placeholder}
    loading={isFetching || loading}
    filterOption={false}
    onSelect={value => {
      updateCache(value)
      if (onSelect) {
        onSelect(valueAsItemReference ? options.firstOrDefault(o => o.key == value)?.object : value)
      }
    }}
    autoClearSearchValue={true}
    showSearch={searchable}
    onChange={(o: any) => handleChange(typeof o === 'object' && o !== undefined && o !== null ? (o.object || o) : o)}
    onDropdownVisibleChange={(open) => {
      if (open && options.length <= 1) {
        loadData();
      }
    }}
    onSearch={handleSearch}
      dropdownRender={(isFetching || options.length <= 0) ? null : props.dropdownRenderCustom}
      {...props}
    >
    {options.map(o => <Option key={o.key} value={o.value}>
      {content ? content(o.object) : <span>{o.text}</span>}
    </Option>)}
  </Select>
}
export default SelectionInput