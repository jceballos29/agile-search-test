import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError, CancelTokenSource } from 'axios';

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

interface ErrorResponse {
	message: string;
}

const baseUrl = 'http://localhost:5001';

export const useApi = <T,>(
	endpoint: string,
	autoFetch: boolean = true, // Control de ejecución automática
) => {
	const [state, setState] = useState<FetchState<T>>({
		data: null,
		loading: false,
		error: null,
	});

	const [cancelSource, setCancelSource] =
		useState<CancelTokenSource | null>(null);

	// Función para cancelar la petición en curso
	const cancelRequest = () => {
		if (cancelSource) {
			cancelSource.cancel('Request canceled');
		}
	};

	// Función para hacer la petición a la API
	const fetchData = useCallback(async () => {
		// Cancelar cualquier petición anterior
		cancelRequest();

		// Crear un nuevo token de cancelación
		const source = axios.CancelToken.source();
		setCancelSource(source);

		// Iniciar la petición
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const response = await axios.get<T>(`${baseUrl}${endpoint}`, {
				cancelToken: source.token,
			});
			setState({
				data: response.data,
				loading: false,
				error: null,
			});
		} catch (error) {
			if (axios.isCancel(error)) {
				console.log('Request canceled', error.message);
			} else if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError;

				// Asumimos que error.response.data es de tipo ErrorResponse
				const errorMessage =
					(axiosError.response?.data as ErrorResponse)?.message ||
					axiosError.message;

				setState({
					data: null,
					loading: false,
					error: errorMessage || 'An Axios error occurred',
				});
			} else {
				// Si el error no es de Axios
				setState({
					data: null,
					loading: false,
					error:
						(error as Error).message ||
						'An unexpected error occurred',
				});
			}
		}
	}, [endpoint]);

	// Si autoFetch está activado, ejecuta la llamada al montar
	useEffect(() => {
		if (autoFetch) {
			fetchData();
		}
		// Cancelamos la petición cuando se desmonta el componente
		return () => cancelRequest();
	}, [fetchData, autoFetch]);

	return {
		...state, // Devuelve el estado actual (data, loading, error)
		refetch: fetchData, // Función para volver a hacer la petición
		cancelRequest, // Función para cancelar manualmente la petición
	};
};
