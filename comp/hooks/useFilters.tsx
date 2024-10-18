import React from 'react';
import { Filters } from '../types';

const saveFiltersToLocalStorage = (filters: Filters) => {
  localStorage.setItem('agileSearchFilters', JSON.stringify(filters));
};

const loadFiltersFromLocalStorage = (): Filters => {
  const storedFilters = localStorage.getItem('agileSearchFilters');
  return storedFilters
    ? JSON.parse(storedFilters)
    : {
        countries: [],
        sectors: [],
        typologies: [],
        locations: [],
        annuities: [],
        category: [],
        targetSectors: [],
        status: [],
        minimis: [],
      };
};

const useFilters = () => {
  const [filters, setFilters] = React.useState<Filters>(loadFiltersFromLocalStorage());

  const updateFilters = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    if (
      newFilters.countries &&
      newFilters.countries.length &&
      JSON.stringify(newFilters.countries) !== JSON.stringify(filters.countries) &&
      filters.locations.length
    ) {
      updatedFilters.locations = [];
    }
    setFilters(updatedFilters);
    saveFiltersToLocalStorage(updatedFilters);
  };

  React.useEffect(() => {
    const storedFilters = loadFiltersFromLocalStorage();
    if (Object.keys(storedFilters).length > 0) {
      setFilters(storedFilters);
    }
  }, []);

  return { filters, updateFilters };
};

export default useFilters;
