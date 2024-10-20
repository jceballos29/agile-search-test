import { CloseSquareOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Row, Tree } from 'antd';
import React, { useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Query, SortDirection } from 'src/core/stores/data-store';
import TreeSelection from './tree-selection';
import AdvancedFilter, {
  FilterDataType,
  AdvancedFilterValue,
  NumberExtras,
  DateExtras,
  TextExtras,
  FilterOp,
  CollectionExtras,
} from './advanced-filter';
import './index.less';

export type { NumberExtras, DateExtras, TextExtras, FilterOp, AdvancedFilterValue, CollectionExtras };
export { FilterDataType };

export interface CustomFilterComponentState {
  value: any;
  isValid: boolean;
  filter: any;
  collectionOp?: 'any' | 'all';
}
export interface CustomFilterComponentProps {
  value: any;
  onChange: (state: CustomFilterComponentState) => void;
}

enum FilteringMode {
  SearchTree = 0,
  AdvancedFilter = 1,
}

export interface ExcelFilterProps extends WithTranslation {
  title: string;
  query: Query;
  dataType?: FilterDataType;
  isCollection?: boolean;
  field: string;
  sortField?: string;
  useProfile?: boolean;
  getDistinctItems?: (q: Query) => Promise<{ label: string; value: string | number; selected?: boolean}[]>
  onQueryChanged: (q: Query, treeSelection?: any[] ) => void;
  onEnd?: () => void;
  nullable?: boolean;
  textExtras?: Partial<TextExtras>;
  numberExtras?: Partial<NumberExtras>;
  dateExtras?: Partial<DateExtras>;
  collectionExtras?: Partial<CollectionExtras>;
  canSort?: boolean;
  overrideSort?: boolean;
  canAdvancedFilter?: boolean;
  canTreeSearchFilter?: boolean;
  initialFilteringMode?: FilteringMode;
  customFilterComponent?: (props: CustomFilterComponentProps) => React.ReactElement;
  onSearch?: (value: string, q: Query) => Promise<{ label: string; value: string | number }[]>;
  advancedFilterCustomLeftComponent?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  advancedFilterCustomRightComponent?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  advancedFilterAllowedOperators?: (opts: FilterOp[]) => FilterOp[];
  isFilterActive?: (q: Query) => boolean;
  isSortActive?: (q: Query) => SortDirection | false;
  customQueryParameter?: string;
  selected?: boolean;
}

const ExcelFilter: React.FC<ExcelFilterProps & { filterSession: number }> = ({
  filterSession,
  t,
  title,
  query: q,
  field,
  sortField = field,
  useProfile = false,
  getDistinctItems,
  onQueryChanged,
  onEnd,
  dataType = FilterDataType.Text,
  nullable = true,
  textExtras,
  numberExtras,
  dateExtras,
  canSort = true,
  canAdvancedFilter = true,
  canTreeSearchFilter = true,
  overrideSort = true,
  customFilterComponent,
  onSearch,
  initialFilteringMode = canTreeSearchFilter ? FilteringMode.SearchTree : FilteringMode.AdvancedFilter,
  advancedFilterCustomLeftComponent,
  advancedFilterCustomRightComponent,
  advancedFilterAllowedOperators,
  isCollection = false,
  collectionExtras,
  isFilterActive, 
  isSortActive,
  customQueryParameter,
  selected
}: ExcelFilterProps & { filterSession: number }) => {
  const [query, setQuery] = useState(q);
  const [treeSelection, setTreeSelection] = useState<any[]>();
  const [distinct, setDistinct] = useState<any[]>([]);

  const [filteringMode, setFilteringMode] = useState<FilteringMode>(initialFilteringMode);
  const [advancedFilterState, setAdvancedFilterState] = useState<CustomFilterComponentState>({
    value: undefined,
    isValid: false,
    filter: undefined,
    collectionOp: ['all', 'any'].includes(collectionExtras?.collectionOperator as any) ? (collectionExtras?.collectionOperator as any) : 'any',
  });

  useEffect(() => {
    setQuery(q);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSortChanged = (direction: SortDirection) => {
    if (!canSort) return;
    if (!!overrideSort) {
      setQuery((curr) => {
        curr.orderBy = curr.orderBy || [];
        const orderBy = curr.orderBy.find((x) => x.field === sortField);
        if (orderBy?.direction === direction) {
          curr.orderBy = [];
        } else {
          curr.orderBy = [{ field: sortField, direction, useProfile }];
        }
        const next = { ...curr }
        onQueryChanged?.(next, (treeSelection && distinct && treeSelection.length !== distinct.length) ? treeSelection : undefined);
        return next;
      });
    } else {
      setQuery((curr) => {
        curr.orderBy = curr.orderBy || [];
        const orderBy = curr.orderBy.find((x) => x.field === sortField);
        if (orderBy == null) {
          curr.orderBy.push({ field: sortField, direction, useProfile });
        } else if (orderBy.direction === direction) {
          curr.orderBy = curr.orderBy.filter((x) => x.field !== sortField);
        } else {
          orderBy.direction = direction;
        }
        const next = { ...curr }
        onQueryChanged?.(next, (treeSelection && distinct && treeSelection.length !== distinct.length) ? treeSelection : undefined);
        return next;
      });
    }
  };

  const onRemoveFilters = () => {
    setAdvancedFilterState({
      value: undefined,
      isValid: false,
      filter: undefined,
      collectionOp: ['all', 'any'].includes(collectionExtras?.collectionOperator as any) ? (collectionExtras?.collectionOperator as any) : 'any',
    });
    setTreeSelection(distinct.map((x) => x.value));
    onExcelFilterChanged(null);
  };

  const onExcelFilterChanged = (nextFilter: any) => {
      setQuery((curr) => {
        curr.odataObject = curr.odataObject || {}
        curr.odataObject.filter = curr.odataObject.filter || {}
        if (nextFilter == null) curr.odataObject.filter[field] = undefined
        else curr.odataObject.filter[field] = nextFilter
        const next = { ...curr, skip: 0 }
        onQueryChanged?.(next, (treeSelection && distinct && treeSelection.length !== distinct.length) ? treeSelection : undefined)
        return next
      })
    
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

  const onOk = () => {
    let final = null;

    const innerField = isCollection ? collectionExtras?.collectionField || field : field;

    if (canTreeSearchFilter && filteringMode === FilteringMode.SearchTree) {
      if (treeSelection == null || treeSelection.length === 0) {
        final = 'false';
      } else if (treeSelection.length !== distinct.length && treeSelection.length === 1) {
        final = { [innerField]: { eq: getValueObject(treeSelection[0]) } } as any;
      } else if (treeSelection.length !== distinct.length) {
        final = { or: treeSelection.map((x) => ({ [innerField]: { eq: getValueObject(x) } })) } as any;
      }
    } else if (canAdvancedFilter && filteringMode === FilteringMode.AdvancedFilter) {
      final = advancedFilterState?.filter;
    }

    if (final != null && final !== 'false' && isCollection) {
      let collectionOp = 'any';
      if (filteringMode === FilteringMode.AdvancedFilter) {
        collectionOp = advancedFilterState?.collectionOp || collectionExtras?.collectionOperator || 'any';
      }
      if (!['all', 'any'].includes(collectionOp)) {
        collectionOp = 'any';
      }

      final = { [field]: { [collectionOp]: final } };
    }

    onExcelFilterChanged(final);
    onEnd?.();
  };

  const sortDirection = isSortActive?.(query) || (query.orderBy || []).find((x) => x.field === sortField)?.direction;
    const filtered = (isFilterActive?.(query) || query.filter?.[field] != null || query.odataObject?.filter?.[field] != null) || (customQueryParameter != null && query.parameters != null && query.parameters[customQueryParameter] != null);

  const canRemoveFilter = filtered || (advancedFilterState != null && advancedFilterState.isValid && advancedFilterState.filter != null);

  return (
    <div className="excel-filter-container">
      {canSort && (
        <>
          <div className={`clickable-div ${sortDirection === 'Ascending' ? 'active' : ''}`.trim()} onClick={() => onSortChanged('Ascending')}>
            <SortAscendingOutlined /> {t('Sort Ascending')}
          </div>
          <div className={`clickable-div ${sortDirection === 'Descending' ? 'active' : ''}`.trim()} onClick={() => onSortChanged('Descending')}>
            <SortDescendingOutlined /> {t('Sort Descending')}
          </div>
        </>
      )}
      {canSort && (canAdvancedFilter || canTreeSearchFilter) && <Divider style={{ margin: 4 }} />}
      {(canAdvancedFilter || canTreeSearchFilter) && (
        <div
          style={{ marginBottom: 5 }}
          className={`clickable-div ${canRemoveFilter ? '' : 'disabled'}`.trim()}
          onClick={() => canRemoveFilter && onRemoveFilters()}
        >
          <CloseSquareOutlined /> {t('Remove Filters')}
        </div>
      )}
      {canAdvancedFilter && filteringMode === FilteringMode.AdvancedFilter && (
        <>
          {customFilterComponent != null ? (
            <>
              {customFilterComponent({
                value: advancedFilterState?.value,
                onChange: setAdvancedFilterState,
              })}
            </>
          ) : (
            <AdvancedFilter
              field={isCollection ? collectionExtras?.collectionField || field : field}
              fieldTitle={title}
              dataType={dataType}
              value={advancedFilterState?.value}
              onChange={setAdvancedFilterState}
              nullable={nullable}
              textExtras={textExtras}
              numberExtras={numberExtras}
              dateExtras={dateExtras}
              customLeftComponent={advancedFilterCustomLeftComponent}
              customRightComponent={advancedFilterCustomRightComponent}
              allowedOperators={advancedFilterAllowedOperators}
              collectionExtras={collectionExtras}
              collectionOperator={advancedFilterState?.collectionOp}
            />
          )}
        </>
      )}
      {canTreeSearchFilter && filteringMode === FilteringMode.SearchTree && (
        <TreeSelection
          value={treeSelection}
          field={field}
          getDistinctItems={getDistinctItems || (() => Promise.resolve([]))}
          onSelectionChanged={(selection, all) => {
            setTreeSelection(selection);
            setDistinct(all);
          }}
          onSearch={onSearch}
          filterSession={filterSession}
          selected={selected}
        />
      )}
      {(canAdvancedFilter || canTreeSearchFilter) && (
        <div>
          <Divider style={{ margin: 4 }} />
          {canAdvancedFilter && canTreeSearchFilter && (
            <Row style={{ paddingTop: 2, paddingBottom: 15 }} gutter={[16, 48]} justify="end">
              <Col>
                <span onClick={() => setFilteringMode((filteringMode + 1) % 2)} className="clickable-span">
                  {filteringMode === FilteringMode.SearchTree ? t('Advanced Filter') : t('Simple Filter')}
                </span>
              </Col>
            </Row>
          )}
          <Row gutter={[16, 48]} justify="end">
            <Col span={8}>
              <Button
                disabled={filteringMode === FilteringMode.AdvancedFilter && !!!advancedFilterState?.isValid}
                style={{ width: '100%' }}
                type="primary"
                onClick={onOk}
              >
                {t('OK')}
              </Button>
            </Col>
            <Col span={8}>
              <Button style={{ width: '100%' }} onClick={onEnd}>
                {t('Cancel')}
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default withTranslation()(ExcelFilter);
