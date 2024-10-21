import React from "react";
import { FiltersContext } from "../context/filters";

export const useFilters = () => {
  const context = React.useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}