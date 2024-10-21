import React from 'react';
import {
	Filters,
	Location,
	Sector,
	Storage,
	Typology,
	UserProfile,
} from '../../../types';
import { nationals } from '../constants/national-location';

interface FiltersContextType {
	options: Storage;
	filters: Filters;
	updateFilters: (newFilters: Filters) => void;
	toggleFilter: (
		type: 'sectors' | 'typologies' | 'locations',
		value: Sector | Typology | Location,
	) => void;
	initialize: (code: string) => void;
	openInitialization: boolean;
	setOpenInitialization: (open: boolean) => void;
	initializing: boolean;
	resetFilters: () => void;
	page: number;
	pageSize: number;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	orderby: string;
	origin: string;
}

export const FiltersContext = React.createContext<
	FiltersContextType | undefined
>(undefined);

interface FiltersProviderProps {
	children: React.ReactNode;
	userProfile: UserProfile;
}

export const FiltersProvider = ({
	children,
	userProfile,
}: FiltersProviderProps) => {
	const [openInitialization, setOpenInitialization] =
		React.useState(false);
	const [initializing, setInitializing] = React.useState(true);
	const [options, setOptions] = React.useState<Storage>({
		countries: [],
		sectors: [],
		typologies: [],
		locations: [],
		annuities: [],
		categories: [],
		beneficiaryTypes: [],
		targetSectors: [],
		status: [],
		minimis: [],
	});
	const [filters, setFilters] = React.useState<Filters>({
		countries: [],
		sectors: [],
		typologies: [],
		locations: [],
		annuities: [],
		category: [],
		beneficiaryTypes: [],
		targetSectors: [],
		status: [],
		minimis: undefined,
	});
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);
	const [orderby] = React.useState('category asc,publicationDate desc');
	const [origin] = React.useState('search');

	const updateFilters = (newFilters: Filters) => {
		if (
			newFilters.countries.length !== filters.countries.length ||
			newFilters.countries.some(
				(country) =>
					!filters.countries.find((c) => c.code === country.code),
			)
		) {
			if (newFilters.countries.length === 1) {
				const national = userProfile.locations.find((location) => {
					return (
						location.countryCode === newFilters.countries[0].code &&
						nationals.includes(location.name)
					);
				});
				if (national) {
					newFilters.locations = [national];
				} else {
					newFilters.locations = [];
				}
			} else {
				newFilters.locations = [];
			}
		}
		setFilters(newFilters);
		localStorage.setItem('agile-filters', JSON.stringify(newFilters));
	};

	const toggleFilter = (
		type: 'sectors' | 'typologies' | 'locations',
		value: Sector | Typology | Location,
	) => {
		const filter = filters[type];
		const newFilters =
			filter.findIndex((f) => f.id === value.id) === -1
				? [...filter, value]
				: filter.filter((f) => f.id !== value.id);

		updateFilters({ ...filters, [type]: newFilters });
	};

	const initialize = (code: string) => {
		const country = userProfile.countries.find(
			(country) => country.code === code,
		);
		const national = userProfile.locations.find((location) => {
			return (
				location.countryCode === code &&
				nationals.includes(location.name)
			);
		});

		if (country) {
			setFilters({
				...filters,
				countries: [country],
				locations: national ? [national] : [],
			});
			localStorage.setItem(
				'agile-filters',
				JSON.stringify({
					...filters,
					countries: [country],
					locations: national ? [national] : [],
				}),
			);
		} else {
			throw new Error('Country not found');
		}
		setInitializing(false);
	};

	const resetFilters = () => {
		setFilters({
			countries: [],
			sectors: [],
			typologies: [],
			locations: [],
			annuities: [],
			category: [],
			beneficiaryTypes: [],
			targetSectors: [],
			status: [],
			minimis: undefined,
		});
		localStorage.removeItem('agile-filters');
		setInitializing(true);
		setOpenInitialization(true);
	};

	React.useEffect(() => {
		const filterFromLocalStorage: Filters | null =
			localStorage.getItem('agile-filters')
				? JSON.parse(localStorage.getItem('agile-filters') as string)
				: null;

		if (filterFromLocalStorage) {
			setFilters(filterFromLocalStorage);
			setInitializing(false);
		} else {
			setOpenInitialization(true);
		}

		setOptions({
			countries: userProfile.countries.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			locations: userProfile.locations.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			sectors: userProfile.sectors.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			typologies: userProfile.typologies.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			annuities: userProfile.annuities.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			categories: [
				{ id: 1, name: 'Very important call', type: 'A' },
				{ id: 2, name: 'Important call', type: 'B' },
				{ id: 3, name: 'Reactive call', type: 'C' },
				{ id: 4, name: 'Call not for companies', type: 'D' },
				{ id: 5, name: "FI doesn't work this call", type: 'E' },
			],
			beneficiaryTypes: userProfile.beneficiaryTypes.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			targetSectors: userProfile.targetSectors.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			status: [
				{ id: 0, name: 'Closed' },
				{ id: 1, name: 'Open' },
				{ id: 2, name: 'Pending publication' },
			],
			minimis: [
				{ id: 0, name: 'No' },
				{ id: 1, name: 'Yes' },
			],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<FiltersContext.Provider
			value={{
				options,
				filters,
				updateFilters,
				toggleFilter,
				initialize,
				openInitialization,
				setOpenInitialization,
				initializing,
				resetFilters,
				page,
				pageSize,
				setPage,
				setPageSize,
				orderby,
				origin,
			}}
		>
			{children}
		</FiltersContext.Provider>
	);
};
