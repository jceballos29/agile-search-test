export interface UserProfile {
  countries: Country[];
  beneficiaryTypes: BeneficiarType[];
  sectors: Sector[];
  targetSectors: targetSector[];
  annuities: Annuity[];
  locations: Location[];
  typologies: Typology[];
  projectGroups: ProjectGroup[];
  areas: string[];
  minYear: number;
  isAdminCountry: boolean;
  isAdmin: boolean;
  isFullAdmin: boolean;
  fullViewer: boolean;
  viewerAllowedCountries: string[];
  adminAllowedCountries: string[];
}

export interface Country {
  name:string;
  code: string;
  icon?: string;
  currency: string;
}

export interface BeneficiarType {
  name: string;
  id: number;
}

export interface Sector {
  name: string;
  id: number;
}

export interface targetSector {
  name: string;
  id: number;
}

export interface Annuity {
  name: string;
  id: number;
}

export interface Location {
  name: string;
  id: number;
  countryCode?: string;
  country: string;
  countryIcon?: string;
}

export interface Typology {
  name: string;
  id: number;
}

export interface ProjectGroup {
  name: string;
  id: number;
  area: string;
  description?: string;
}

export interface Category {
  name: string;
  id: number;
  type: string;
}

export interface Status {
  name: string;
  id: number;
}

export interface Minimis {
  name: string;
  id: number;
}

export type FiltersOptions = 'countries' | 'sectors' | 'typologies' | 'locations' | 'annuities' | 'category' | 'targetSectors' | 'status' | 'minimis' | 'beneficiaryTypes';

export interface Filters {
  countries: Country[];
  sectors: Sector[];
  typologies: Typology[];
  locations: Location[];
  annuities: Annuity[];
  category: Category[];
  beneficiaryTypes: BeneficiarType[];
  targetSectors: targetSector[];
  status: Status[];
  minimis: Minimis | undefined;
}

export interface Storage {
  countries: Country[];
  sectors: Sector[];
  typologies: Typology[];
  locations: Location[];
  annuities: Annuity[];
  categories: Category[];
  beneficiaryTypes: BeneficiarType[];
  targetSectors: targetSector[];
  status: Status[];
  minimis: Minimis[];
}

export interface SearchStep {
  step: number;
  type: FiltersOptions | 'results';
  title: string;
  description: string;
  next: FiltersOptions | null | 'results';
  previous: FiltersOptions | null | 'results';
}

export interface Period {
  id: number;
  openningDate: string;
  closingDate: string;
}

export interface Grant {
  publicationDate: string;
  published: boolean;
  isFavorite: boolean;
  beneficiaryTypesId: number[];
  sectors: number[];
  typologies: number[];
  locations: number[];
  annuities: number[];
  category: string;
  periods: Period[];
  modalityParticipation?: string;
  financingModality: string[];
  financingModalityValue?: number;
  scope?: string;
  id: number;
  countryId: string;
  status: string;
  title: string;
  description: string;
}

export interface AgileSearchResponse {
  count: number;
  items: Grant[];
}