import {Input, Spin } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Query} from 'src/core/stores/data-store';
import {setEquals, intersection} from 'src/core/utils/set';

export interface TreeSelectionProps extends WithTranslation {
    filterSession: number;
    field: string;
    value?: any[];
    onSelectionChanged: (next: any[], all: {label: string, value: any}[]) => void;
    getDistinctItems: (q: Query) => Promise<{ label: string; value: string | number; selected?: boolean}[]>;
    onSearch?: (value:string, q: Query) => Promise<{ label: string; value: string | number }[]>;
    selected?: boolean;
  }

const TreeSelection: React.FC<TreeSelectionProps> = ({t, field, getDistinctItems, onSelectionChanged, onSearch:onSearchFunc, value, filterSession, selected}) => {
  const [distinct, setDistinct] = useState<{label: string, value: any}[]>([]);
  const [treeSearch, setTreeSearch] = useState('');
  const [treeSelection, setTreeSelection] = useState<any[]>(value ?? []);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useMemo(async () => {
    if (filterSession <= 0) return;
    setLoadingSearch(true);
    const result = await getDistinctItems({
      skip: 0,
      take: 500,
      odataObject: {
        transform: {
          groupBy: {
            properties: [field]
          }
        },
        // select: [field]
      }
    } as unknown as Query);
    if (filterSession === 1 || selected) {
      setDistinct(result);
      setTreeSelection(result.filter(x =>  x.selected === undefined ? true : x.selected === true).map((x) => x.value));
      setSearchResult(result);
      setTreeSearch('');
    }
    else {
      const same = setEquals(distinct, result, (x,y) => x.label === y.label && x.value === y.value)
      setDistinct(result);
      if (!same) {
        onSelectionChanged(treeSelection, result);
        setTreeSelection(curr => intersection(curr, result.map(x => x.value), (x,y) => x === y))
        setSearchResult(result);
        setTreeSearch('');
      }
    }
    setLoadingSearch(false);
  }, [filterSession]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (value != null && !setEquals(value, treeSelection, (x,y) => x === y)) {
      setTreeSelection(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!setEquals(value, treeSelection, (x,y) => x === y)) {
      onSelectionChanged(treeSelection, distinct);
    }
  }, [treeSelection, distinct]); // eslint-disable-line react-hooks/exhaustive-deps

  const executeSearch = (value:string) => {
    if (onSearchFunc == null) {
      const v = (value || '').toLowerCase();
      if (v.length === 0) 
        return Promise.resolve([...distinct]);
      return Promise.resolve(distinct.filter((x) => x.label.toLowerCase().startsWith(v) || String(x.value).toLowerCase().startsWith(v)));
    } else {
      return onSearchFunc(value, {
        skip: 0,
        take: 500,
        parameters: {
          $apply: `groupby((${field}))`
        } as any
      } as Query);
    }
  }

  const onSearch = async (value: string) => {
    if (timerRef?.current != null) clearTimeout(timerRef.current);
    setLoadingSearch(true);
    const result = await executeSearch(value);
    setLoadingSearch(false);
    setSearchResult(result);
    setTreeSearch(value);
    // if ((value || '').length !== 0) {
    setTreeSelection(result.map((x) => x.value));
    // }
  };

  const onSearchValueChanged = (value: string) => {
    if (treeSearch !== value) {
      if (timerRef?.current != null) clearTimeout(timerRef.current);
      if ((value || '').length === 0) onSearch(value);
      else {
        timerRef.current = setTimeout(() => {
          onSearch(value);
        }, 1000);
      }
    }
    setTreeSearch(value);
  };

  const searchResultValues = searchResult.map((x) => x.value);
  const searching = (treeSearch || '').length !== 0;

  return (
    <div className="tree-container">
      <Input.Search className="search" allowClear value={treeSearch} placeholder={t("Search")} onSearch={onSearch} onChange={(e) => onSearchValueChanged(e?.target?.value)} />
      <div className="tree">
        {loadingSearch && <div className="tree-spinner"><Spin size="large" spinning={true} /></div>}
        {!loadingSearch && <>
          {searchResult.length !== 0 && (
            <div>
              <Checkbox
                indeterminate={treeSelection.length !== 0 && ((!searching &&  treeSelection.length < distinct.length) || (searching && treeSelection.length < searchResult.length))}
                checked={treeSelection.length === distinct.length || treeSelection.length === searchResult.length ? true : treeSelection.length === 0 ? false : null}
                onChange={(e) =>
                  setTreeSelection(e.target.checked ? searchResultValues : treeSelection.filter((x) => !searchResultValues.includes(x)))
                }
              />
              <span> ({treeSearch ? t('Select All Search Results') : t('Select All')})</span>
            </div>
          )}
          {searchResult.length === 0 && <div style={{ color: 'gainsboro', paddingTop: 5, textAlign: 'center' }}>{t('No matches')}</div>}
          {searchResult.map((x) => (
            <div key={x.value}>
              <Checkbox
                checked={treeSelection.includes(x.value)}
                onChange={(e) => setTreeSelection(e.target.checked ? [...treeSelection, x.value] : treeSelection.filter((s) => s !== x.value))}
              />
              <span> {x.label}</span>
            </div>
          ))}
        </>}
      </div>
    </div>)
}

export default withTranslation()(TreeSelection);