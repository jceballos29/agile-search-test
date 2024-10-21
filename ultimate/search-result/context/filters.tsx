import { AnnuitySummary } from "src/stores/annuity-store";
import { BeneficiaryTypeSummary } from "src/stores/beneficiary-type-store";
import { CountrySummary } from "src/stores/country-store";
import { SectorSummary } from "src/stores/sector-store";
import { TargetSectorSummary } from "src/stores/targetSector-store";
import { TypologySummary } from "src/stores/typology-store";
import { CategorySummary, MinimisSummary, StatusSummary } from "../components/filters/filters";
import React from "react";
import { CacheProps, withCache } from "src/core/services/cache.service";

export interface IFilters {
  countries: CountrySummary[]
  locations: CountrySummary[]
  annuities: AnnuitySummary[]
  typologies: TypologySummary[]
  sectors: SectorSummary[]
  targetSectors: TargetSectorSummary[]
  beneficiaryTypes: BeneficiaryTypeSummary[]
  categories: CategorySummary[]
  status: StatusSummary[]
  minimis: MinimisSummary | undefined
}

interface FiltersContextProps {
  filters: IFilters
  updateFilters: (filters: IFilters) => void
  resetFilters: () => void
  page: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (pageSize: number) => void
}

export const FiltersContext = React.createContext<FiltersContextProps | undefined>(undefined);

interface FiltersProviderProps extends CacheProps {
  children: React.ReactNode
}

const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
  const [filters, setFilters] = React.useState<IFilters>({
    countries: [],
    locations: [],
    annuities: [],
    typologies: [],
    sectors: [],
    targetSectors: [],
    beneficiaryTypes: [],
    categories: [],
    status: [],
    minimis: undefined
  });

  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const updateFilters = (filters: IFilters) => {
    setFilters(filters);
  }

  const resetFilters = () => {
    setFilters({
      countries: [],
      locations: [],
      annuities: [],
      typologies: [],
      sectors: [],
      targetSectors: [],
      beneficiaryTypes: [],
      categories: [],
      status: [],
      minimis: undefined
    });
  }

  return (
    <FiltersContext.Provider value={{ filters, updateFilters, resetFilters, page, setPage, pageSize, setPageSize }}>
      {children}
    </FiltersContext.Provider>
  );
}

export default withCache(FiltersProvider);