import React from 'react';
import StepsProvider from './steps';
import StorageProvider from './storage';

export interface AgileSearchProviderProps {
  children: React.ReactNode;
}

const AgileSearchProvider: React.FC<AgileSearchProviderProps> = ({ children }) => {
  return (
    <StorageProvider>
      <StepsProvider>{children}</StepsProvider>;
    </StorageProvider>
  );
};

export default AgileSearchProvider;
