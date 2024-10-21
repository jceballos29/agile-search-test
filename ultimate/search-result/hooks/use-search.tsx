import React from 'react';
// import HttpService from 'src/core/services/http.service';
// import { container } from 'src/inversify.config';

interface FetchSearchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ErrorResponse {
  message: string;
}

export const useSearch = <T,>(
  endpoint: string,
  filter: any,
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  autoFetch: boolean = true
) => {
  // const httpService = container.get(HttpService);
  const [state, setState] = React.useState<FetchSearchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const [cancelSource, setCancelSource] = React.useState<AbortController | null>(null);

  const cancelRequest = () => {
    if (cancelSource) {
      cancelSource.abort();
    }
  };

  React.useEffect(() => {
    if (autoFetch) {
      console.log('fetching data');
      console.log({
        endpoint,
        filter,
        page,
        pageSize,
        search,
      });
    }
  }, [endpoint, filter, page, pageSize, search, autoFetch]);

  return {
    ...state,
    cancelRequest,
  };
};
