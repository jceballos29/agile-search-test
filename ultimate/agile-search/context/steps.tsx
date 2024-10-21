import React, { createContext } from 'react';
import { FiltersOptions, SearchStep } from '../types';
import { useHistory, useLocation } from 'react-router-dom';

export interface StepsContextProps {
  steps: SearchStep[];
  activeStep: SearchStep;
  handleSetStep: (type: FiltersOptions | 'results') => void;
}

export const StepContext = createContext<StepsContextProps | undefined>(undefined);

export interface StepProviderProps {
  children: React.ReactNode;
}

const StepsProvider: React.FC<StepProviderProps> = ({ children }) => {
  
  const steps: SearchStep[] = [
    {
      step: 0,
      type: 'sectors',
      title: 'Select a sector',
      description: 'Click on the tags to select a sector',
      next: 'typologies',
      previous: null,
    },
    {
      step: 1,
      type: 'typologies',
      title: 'Select a typology',
      description: 'Click on the tags to select a typology',
      next: 'locations',
      previous: 'sectors',
    },
    {
      step: 2,
      type: 'locations',
      title: 'Select a region',
      description: 'Click here to add a region to the national call for applications.',
      next: 'results',
      previous: 'typologies',
    },
    {
      step: 3,
      type: 'results',
      title: 'Results',
      description: 'Click here to see the results of the search',
      next: null,
      previous: 'locations',
    },
  ];

  const [activeStep, setActiveStep] = React.useState<SearchStep>(steps.find((step) => step.step === 0) as SearchStep);

  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const handleSetStep = (type: FiltersOptions | 'results') => {
    const step = steps.find((step) => step.type === type) as SearchStep;
    queryParams.set('step', step.type);
    history.push({ search: queryParams.toString() });
    setActiveStep(step);
  };

  React.useEffect(() => {
    const stepParam = queryParams.get('step');
    const defaultStep = steps.find((s) => s.type === stepParam) || steps[0];
    handleSetStep(defaultStep.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <StepContext.Provider value={{ activeStep, handleSetStep, steps }}>{children}</StepContext.Provider>;
};

export const useStep = () => {
  const context = React.useContext(StepContext);
  if (!context) {
    throw new Error('useStep must be used within a StepProvider');
  }
  return context;
};

export default StepsProvider;
