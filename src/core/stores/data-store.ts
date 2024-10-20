import HttpService from '../services/http.service';
// TODO: Solve this patch
import { container } from 'src/inversify.config';
import Store, { BaseState } from './store';
import buildQuery, { Select, Filter, Expand, PlainObject } from 'odata-query';
import { CommandResult } from './types';
import { createPatch } from 'rfc6902';
import qs from 'query-string';
import { getProperties } from '../utils/object';

export type SortDirection = 'Ascending' | 'Descending';

export interface OrderDefinition {
  field: string;
  direction: SortDirection;
  useProfile: boolean;
}

export interface QueryParameters {
  [key: string]: string | string[] | number | number[] | undefined;
}

export interface SortProfile {
  profile: string;
  direction: SortDirection;
}

export interface OdataQueryOptions {
  select: Select<any>;
  filter: { [key: string]: Filter };
  levels: number | 'max';
  count: boolean | Filter;
  expand: Expand<any>;
  transform: PlainObject | PlainObject[];
  key: string | number | PlainObject;
  action: string;
  func: string | { [functionName: string]: { [parameterName: string]: any } };
  format: string;
}

export interface Query {
  searchQuery: string;
  orderBy?: OrderDefinition[];
  skip: number;
  take: number;
  parameters?: QueryParameters;
  filter?: object;
  odataObject?: Partial<OdataQueryOptions>;
}

export interface QueryResult<T> {
  count: number;
  items: T[];
}

export interface ListState<T> extends BaseState {
  count: number;
  items: T[];
}

class DataStore<T> extends Store<ListState<T>> {
  protected httpService!: HttpService;

  protected _baseUrl: string;

  public get baseUrl() {
    return this._baseUrl;
  }
  public set baseUrl(url: string) {
    this._baseUrl = url;
  }

  constructor(baseUrl: string, initialState: T[]) {
    super({
      count: initialState ? initialState.length : 0,
      items: initialState || []
    });
    this.httpService = container.get(HttpService);
    this._baseUrl = baseUrl;
  }

  public async load(query: Partial<Query>) {
    return await this.handleCallAsync(async () => {
      var response = await this.httpService.get<QueryResult<T>>(`${this.baseUrl}?${DataStore.buildUrl(query as Query)}`);
      this._state.set((s) => {
        s.items = response.data.items || (response.data as any).value || [];
        s.count = response.data.count || response.data['@odata.count'] || 0;
        return s;
      });
      return true;
    });
  }

  public async clear() {
    this._state.set((s) => {
      s.isBusy = false;
      s.items = [];
      s.count = 0;
      return s;
    });
    return true;
  }

  protected async save(id: string, item: T) {
    return await this.handleCallAsync(async () => {
      var result = await this.httpService.put(`${this.baseUrl}/${encodeURIComponent(id)}`, item);
      return result.data;
    });
  }

  protected async patch(selector: (o: T) => boolean, path: string, partial: Partial<T>) {
    return await this.handleCallAsync(async () => {
      var items = this._state.value.items.filter((o) => selector(o));
      if (items == null || items.length === 0 || items.length > 1) throw Error('No item found to patch');
      var item = items[0];
      var result = await this.httpService.patch(`${this.baseUrl}/${encodeURIComponent(path)}`, createPatch(item, partial));
      return result.data;
    });
  }

  public async delete(id: string, params?: any) {
    return await this.handleCallAsync(async () => {
      var response = await this.httpService.delete<any, CommandResult<T>>(`${this.baseUrl}/${encodeURIComponent(id)}`, params);
      return response.data;
    });
  }

  public static buildUrl(query: Query) {
    const parts = [];
    if (query.searchQuery) {
      parts.push(`$search=${query.searchQuery}`);
    }

    var oDataQuery = {
      skip: query.skip || 0,
      top: query.take || 10
    } as any;

    if (query.orderBy && query.orderBy.length > 0) {
      var sortProfile = query.orderBy.filter((o) => o.useProfile);
      if (sortProfile.length > 0) {
        parts.push(`sortProfile=${sortProfile[0].field} ${sortProfile[0].direction}`);
      } else {
        var order = [];
        for (var i = 0; i < query.orderBy.length; i++) {
          let direction = query.orderBy[i].direction === 'Ascending' ? 'asc' : 'desc';
          order.push(`${query.orderBy[i].field} ${direction}`);
        }
        oDataQuery['orderBy'] = order;
      }
    }

    if (query.filter) {
      oDataQuery['filter'] = query.filter;
    }

    parts.push(buildQuery(oDataQuery).substr(1));

    if (query.parameters) {
      for (var prop in query.parameters as any) {
        if (query.parameters[prop] && query.parameters[prop]!.constructor === Array) {
          for (var idx = 0; idx < (query.parameters[prop] as any)!.length; idx++) {
            if ((query.parameters[prop] as any)![idx]) parts.push(`${prop}=${encodeURIComponent((query.parameters[prop] as any)![idx])}`);
          }
        } else {
          if (query.parameters[prop]) parts.push(`${prop}=${encodeURIComponent(query.parameters[prop] as string)}`);
        }
      }
    }

    const usualResult = parts.join('&');
    let final = usualResult;

    if (query.odataObject != null) {
      const f = query.odataObject.filter;
      let queryObj = { ...query.odataObject, filter: [] };
      if (f != null)
        queryObj.filter = getProperties(f)
          .map((x) => x.value)
          .filter((x) => x != null);

      const newResult = buildQuery(queryObj);
      final = DataStore.merge(usualResult, newResult).substr(1);
    }

    return final;
  }

  public static merge(odataUri1: string, odataUri2: string) {
    const parts1 = qs.parse(odataUri1, {decode: false});
    const split = odataUri2.split('?');
    const path = split[0];
    const parts2 = qs.parse(split[1], {decode: false});

    const filters = [parts1['$filter'], parts2['$filter']].filter((x) => (x || '').length !== 0);
    let filter = null;
    if (filters.length === 1) filter = filters[0];
    else if (filters.length === 2) filter = `(${filters[0]})%20and%20(${filters[1]})`;

    const selects = [parts1['$select'], parts2['$select']].filter((x: any) => (x || '').length !== 0).map((x: any) => x.split(','));
    let select = null;
    if (selects.length !== 0) {
      const set = new Set<string>();
      selects.forEach((arr) =>
        arr.forEach((s) => {
          if (!set.has(s)) set.add(s);
        })
      );
      select = [...(set as any)].join(',');
    }

    // TODO: Merge here more sections

    const final = Object.assign({}, parts1, parts2, { $select: select, $filter: filter });

    if (select == null) delete final['$select'];
    if (filter == null) delete final['$filter'];

    return `${path}?${getProperties(final)
      .filter((x) => x.value != null)
      .map((x) => `${x.key}=${x.value}`)
      .join('&')}`;
  }
}

export default DataStore;
