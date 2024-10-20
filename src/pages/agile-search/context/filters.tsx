import React, { createContext } from "react";
import { Filters } from "../types";

export interface FilterContextProps {
  filters: Filters;
  updateFilters: (newFilters: Partial<Filters>) => void;
}

export const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export interface FilterProviderProps {
  children: React.ReactNode;
}

const FilterProvider: React.FC<FilterProviderProps> = (props) => {
  const { children } = props;

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

  return (
    <FilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

export default FilterProvider;
