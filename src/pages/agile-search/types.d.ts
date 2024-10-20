export type FiltersOptions = 'countries' | 'sectors' | 'typologies' | 'locations' | 'annuities' | 'category' | 'targetSectors' | 'status' | 'minimis';

export interface Filters {
  countries: any[];
  sectors: any[];
  typologies: any[];
  locations: any[];
  annuities: any[];
  category: any[];
  targetSectors: any[];
  status: any[];
  minimis: any[];
}

export interface SearchStep {
  step: number;
  type: FiltersOptions | 'results';
  title: string;
  description: string;
  next: FiltersOptions | null | 'results';
  previous: FiltersOptions | null | 'results';
}