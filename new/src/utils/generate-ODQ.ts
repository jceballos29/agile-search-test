import { Filters } from '../types';
import { calculateTopAndSkip } from './calculate-top-skip';

export interface DataQuery {
	filters: Filters;
	orderby?: string;
	page?: number;
	pageSize: number;
	origin?: string;
	search?: string;
}

const generateFilters = (filters: Filters): string => {
	const filterParts: string[] = [];

	if (filters.annuities.length) {
		const annuitiesFilter = filters.annuities
			.map(
				(annuity) =>
					`Annuities/any(annuities:annuities/AnnuityId eq ${annuity.id})`,
			)
			.join(' or ');
		filterParts.push(`(${annuitiesFilter})`);
	}

	if (filters.locations.length) {
		const locationsFilter = filters.locations
			.map(
				(location) =>
					`Locations/any(locations:locations/LocationId eq ${location.id})`,
			)
			.join(' or ');
		filterParts.push(`(${locationsFilter})`);
	}

	if (filters.minimis) {
		filterParts.push(`minimis eq '${filters.minimis.name}'`);
	}

	if (filters.status.length) {
		const statusesFilter = filters.status
			.map((status) => `status eq '${status.name}'`)
			.join(' or ');
		filterParts.push(`(${statusesFilter})`);
	}

	if (filters.category.length) {
		const categoriesFilter = filters.category
			.map((category) => `category eq '${category.type}'`)
			.join(' or ');
		filterParts.push(`(${categoriesFilter})`);
	}

	if (filters.beneficiaryTypes.length) {
		const beneficiaryTypesFilter = filters.beneficiaryTypes
			.map(
				(beneficiaryType) =>
					`BeneficiaryTypes/any(beneficiarytypes:beneficiarytypes/BeneficiaryTypeId eq ${beneficiaryType.id})`,
			)
			.join(' or ');
		filterParts.push(`(${beneficiaryTypesFilter})`);
	}

	if (filters.typologies.length) {
		const typologiesFilter = filters.typologies
			.map(
				(typology) =>
					`Typologies/any(typologies:typologies/TypologyId eq ${typology.id})`,
			)
			.join(' or ');
		filterParts.push(`(${typologiesFilter})`);
	}

	if (filters.sectors.length) {
		const sectorsFilter = filters.sectors
			.map(
				(sector) =>
					`Sectors/any(sectors:sectors/SectorId eq ${sector.id})`,
			)
			.join(' or ');
		filterParts.push(`(${sectorsFilter})`);
	}

	if (filters.countries.length) {
		const countriesFilter = filters.countries
			.map((country) => `countryId eq '${country.code}'`)
			.join(' or ');
		filterParts.push(`(${countriesFilter})`);
	}

	if (filters.targetSectors.length) {
		const targetSectorsFilter = filters.targetSectors
			.map(
				(targetSector) =>
					`TargetSectors/any(targetsectors:targetsectors/TargetSectorId eq ${targetSector.id})`,
			)
			.join(' or ');
		filterParts.push(`(${targetSectorsFilter})`);
	}

	return filterParts.length ? filterParts.join(' and ') : '';
};

export const generateODataQuery = (dataQuery: DataQuery): string => {
	const { filters, orderby, page, pageSize, origin, search } =
		dataQuery;
	const queryParts: string[] = [];

	if (search) {
		queryParts.push(`$search=${encodeURIComponent(search)}`);
	}

	if (Object.keys(filters).length > 0) {
		const filtersString = generateFilters(filters);
		queryParts.push(`$filter=${encodeURIComponent(filtersString)}`);
	}

	if (orderby) {
		queryParts.push(`$orderby=${encodeURIComponent(orderby)}`);
	}

	if (page && pageSize) {
		const { top, skip } = calculateTopAndSkip(page, pageSize);
		queryParts.push(`$top=${top}`);
		queryParts.push(`$skip=${skip}`);
	}

	if (origin) {
		queryParts.push(`origin=${encodeURIComponent(origin)}`);
	}

	const queryString = queryParts.join('&');
	return queryString ? `?${queryString}` : '';
};
