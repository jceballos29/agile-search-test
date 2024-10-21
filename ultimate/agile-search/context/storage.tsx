import React, { createContext } from 'react';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import useFilters from '../hooks/useFilters';

export interface StorageContextProps {
  countries: any[];
  locations: any[];
  typologies: any[];
  sectors: any[];
  annuities: any[];
  categories: any[];
  targetSectors: any[];
  status: any[];
  minimis: any[];
  updateLocations: (countries: any[]) => void;
}

export const StorageContext = createContext<StorageContextProps | undefined>(undefined);

export interface StorageProviderProps extends UserProfileProps {
  children: React.ReactNode;
}

const StorageProvider: React.FC<StorageProviderProps> = (props) => {
  const { children, userProfile } = props;

  const [countries] = React.useState<any[]>(userProfile.countries.sort((a, b) => a.name.localeCompare(b.name)));
  const [locations, setLocations] = React.useState<any[]>([]);
  const [typologies] = React.useState<any[]>(userProfile.typologies.sort((a, b) => a.name.localeCompare(b.name)));
  const [sectors] = React.useState<any[]>(userProfile.sectors.sort((a, b) => a.name.localeCompare(b.name)));
  const [annuities] = React.useState<any[]>(userProfile.annuities.sort((a, b) => a.name.localeCompare(b.name)));
  const [categories] = React.useState<any[]>([
    { id: 1, name: 'Very important call', type: 'A' },
    { id: 2, name: 'Important call', type: 'B' },
    { id: 3, name: 'Reactive call', type: 'C' },
    { id: 4, name: 'Call not for companies', type: 'D' },
    { id: 5, name: "FI doesn't work this call", type: 'E' },
  ]);
  const [targetSectors] = React.useState<any[]>(userProfile.targetSectors.sort((a, b) => a.name.localeCompare(b.name)));
  const [status] = React.useState<any[]>([
    { id: 0, name: 'Closed' },
    { id: 1, name: 'Open' },
    { id: 2, name: 'Pending publication' },
  ]);
  const [minimis] = React.useState<any[]>([
    { id: 0, name: 'No' },
    { id: 1, name: 'Yes' },
  ]);

  const { filters } = useFilters();

  const updateLocations = (countries: any[]) => {
    const regions = [];
    countries.forEach((country) => regions.push(...userProfile.locations.filter((location) => location.countryCode === country.code)));
    setLocations(regions);
  }

  React.useEffect(() => {
    updateLocations(filters.countries)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.countries]);

  return (
    <StorageContext.Provider
      value={{
        countries,
        locations,
        typologies,
        sectors,
        annuities,
        categories,
        targetSectors,
        status,
        minimis,
        updateLocations
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = React.useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

export default withUserProfile(StorageProvider);