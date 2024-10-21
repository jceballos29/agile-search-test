import axios, { CancelTokenSource } from 'axios';
import React from 'react';
import { DataQuery, generateODataQuery } from '../utils';
import { Filters } from '../types';

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
}

type QueryParams = Omit<DataQuery, 'filters'>;

const baseUrl = 'http://localhost:5001';

export const useSearchGrant = <T,>(
	endpoint: string,
	filters: Filters = {} as Filters, // Valor predeterminado
	initialParams: QueryParams | null = null,
	search: string = '',
	initialFetch: boolean = false,
) => {
	const [state, setState] = React.useState<FetchState<T>>({
		data: null,
		loading: true,
		error: null,
	});
	const [params, setParams] = React.useState<QueryParams>(
		initialParams || ({} as QueryParams),
	);
	const [shouldFetch, setShouldFetch] = React.useState(initialFetch);

	React.useEffect(() => {
		const source: CancelTokenSource = axios.CancelToken.source();

		const hasFilters = () => Object.keys(filters).length > 0;
		const hasParams = () => Object.keys(params).length > 0;
		const hasSearch = () => search.trim() !== '';

		const fetchData = async () => {
			setState((prevState) => ({ ...prevState, loading: true }));

			let url = endpoint;

			if (hasFilters() || hasParams() || hasSearch()) {
				// Generar el query solo si hay filtros, parámetros o búsqueda
				const queryString = generateODataQuery({
					...params,
					filters,
					search,
				});
				url = `${endpoint}${queryString}`;
			}

			try {
				const response = await axios.get<T>(
					`${baseUrl}${url}`,
					{ cancelToken: source.token },
				);
				setState({
					data: response.data,
					loading: false,
					error: null,
				});
			} catch (error) {
				if (axios.isCancel(error)) {
					console.log('Request canceled', error.message);
				} else {
					setState({
						data: null,
						loading: false,
						error: error as Error,
					});
				}
			}
		};

		if (shouldFetch) {
			fetchData();
		} else if (hasFilters() || hasParams()) {
			setShouldFetch(true);
		} else {
			setState({ data: null, loading: false, error: null });
		}

		return () => {
			source.cancel('Operation canceled by the user.');
		};
	}, [endpoint, params, filters, search, shouldFetch]);

	return { ...state, setParams, setShouldFetch };
};
