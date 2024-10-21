import React from "react";
import { StepContext } from "../context/steps";

export const useStep = () => {
  const context = React.useContext(StepContext);
  if (context === undefined) {
    throw new Error('useStep must be used within a StepProvider');
  }
  return context;
};

// import { useLocation, useNavigate } from 'react-router-dom';
// import { SearchStep } from '../../../types';
// import React from 'react';

// const useSteps = () => {
// 	const steps: SearchStep[] = React.useMemo(() => [
// 		{
// 			step: 0,
// 			type: 'sectors',
// 			title: 'Select a sector',
// 			description: 'Click on the tags to select a sector',
// 			next: 'typologies',
// 			previous: null,
// 		},
// 		{
// 			step: 1,
// 			type: 'typologies',
// 			title: 'Select a typology',
// 			description: 'Click on the tags to select a typology',
// 			next: 'locations',
// 			previous: 'sectors',
// 		},
// 		{
// 			step: 2,
// 			type: 'locations',
// 			title: 'Select a region',
// 			description:
// 				'Click here to add a region to the national call for applications.',
// 			next: 'results',
// 			previous: 'typologies',
// 		},
// 		{
// 			step: 3,
// 			type: 'results',
// 			title: 'Results',
// 			description: 'Click here to see the results of the search',
// 			next: null,
// 			previous: 'locations',
// 		},
// 	], []);

// 	const initialStep = steps.find(
// 		(step) => step.step === 0,
// 	) as SearchStep;
// 	const [activeStep, setActiveStep] =
// 		React.useState<SearchStep>(initialStep);

// 	const navigate = useNavigate();
// 	const location = useLocation();
// 	const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);

// 	const handleSetStep = React.useCallback((type: string) => {
// 		const step = steps.find((step) => step.type === type);

// 		if (step) {
// 			queryParams.set('step', step.type);
// 			navigate(`?${queryParams.toString()}`);
// 			setActiveStep(step);
// 		}
// 	}, [steps, queryParams, navigate]);

// 	React.useEffect(() => {
// 		const stepParam = queryParams.get('step') || 'sectors';
// 		const currentStep = steps.find((step) => step.type === stepParam);
// 		if (currentStep) {
// 			handleSetStep(currentStep.type);
//     }
// 	}, [handleSetStep, queryParams, steps]);

// 	return { steps, activeStep, handleSetStep };
// };

// export default useSteps;
