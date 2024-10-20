import * as React from 'react';
import { AutoComplete } from 'antd';
import '../../utils/linq';
import { QueryResult } from '../../stores/data-store';
import debounce from 'lodash.debounce';
import { FC, useCallback, useEffect, useState } from 'react';
import Footer from './editor-footer';
const Option = AutoComplete.Option;

interface AutoCompleteProps {
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
  nullable?: boolean;
  minWidth?: number;
  width?: number;
  // readonly: boolean,
  content?: (item: any) => React.ReactElement<any>;
  multiple?: boolean;
  forcereload?: boolean;
  searchQuery?: string;
  placeholder?: string;
  valueAsItemReference?: boolean,
  value: any | any[] | string | string[];
  onChange: (item: any | any[] | string | string[] | undefined) => void;
  onSelect?: (item: any | any[] | string | string[] | undefined) => void;
  onSearch?: (value: string) => void;
  options?: SelectionItem[];
  query?: (searchQuery: string, selectedValue: any) => Promise<QueryResult<any>>;
  hideText?: boolean;
  url?: string;
  showFooter?: boolean;
  // onAdd: (item: ItemReference) => void,
  // onRemove: (item: ItemReference) => void
}

export interface SelectionItem {
  key: string;
  text: string;
  value: string;
  object?: any;
}

const AutoCompleteInput: FC<AutoCompleteProps> = ({ minWidth, width, className, disabled, nullable, valueAsItemReference, onSelect, content, multiple, searchable, placeholder, hideText, query, value, onChange, onSearch, showFooter, ...props }) => {
  const [options, setOptions] = useState<SelectionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalCount, setCount] = useState<number>(0);

  const debouncedQuery = useCallback(
    debounce(async (searchQuery, value) => {
      try {        
        const queryResult = await query!(searchQuery, value) as any;

        let options = (queryResult.items || []).map((o: any) => addContent({
          key: o.id == null ? 'NULL_VALUE' : o.id,
          value: o.id,
          text: o.title,
          object: o
        } as SelectionItem, o));
        setOptions(options);
        setCount(queryResult.count || 0);
      } finally {        
      }
    }, 1000),
    [query]
  );

  useEffect(() => {
    loadData();
  }, [searchQuery])

  const handleChange = (value: any) => {    
    if (value === undefined || value === null) {
      return;
    }

    const filteredOptions = options.filter((o) => o.value === value);
    if (filteredOptions.length > 0) {
      const item: any | string = filteredOptions[0].object || filteredOptions[0].value;
      onChange(item);
    }
    else
      onChange(value);
  }

  const handleSearch = (query: string) => {    
    setSearchQuery(query);
    if (onSearch)
      onSearch(query);
  }

  const addContent = (item: any, obj: any) => {
    item.searchableText = item.text;
    if (content) {
      item.text = content(obj);
    }
    return item;
  };

  const loadData = async () => {
    await debouncedQuery(searchQuery, value);
  }

  const isFooterVisible = () => {
    return showFooter && totalCount > options.length;
  }

  return <AutoComplete style={{ minWidth: minWidth, width: width || '100%' }}
    className={className}    
    disabled={disabled}
    allowClear={nullable}
    value={value?.id || value}
    placeholder={placeholder}    
    onSelect={value => {
      if (onSelect) {
        onSelect(value)
      }
    }}    
    onChange={(o: any) => handleChange(o)}       
    onSearch={handleSearch}
    dropdownRender={(menu: React.ReactElement) => isFooterVisible() ? < Footer total={totalCount} size={options.length}>{menu}</Footer> : menu}
    {...props}>
    {options.map(o => <Option key={o.key} value={o.value}>
      {content ? content(o.object) : <span>{o.text}</span>}
    </Option>)}
  </AutoComplete>
}
export default AutoCompleteInput