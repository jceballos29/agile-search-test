import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type StepType = 'sectors' | 'typologies' | 'locations' | 'results';

interface Step {
	type: StepType;
	step: number;
	title: string;
	description: string;
	deleteView: boolean;
	addView: boolean;
	previous: StepType | null;
	next: StepType | null;
}

interface StepContextType {
	activeStep: Step;
	handleSetStep: (
		type: StepType,
		deleteView?: boolean,
		addView?: boolean,
	) => void;
}

export const StepContext = React.createContext<
	StepContextType | undefined
>(undefined);

interface StepProviderProps {
	children: React.ReactNode;
}

export const StepProvider: React.FC<StepProviderProps> = ({
	children,
}) => {
	const steps: Step[] = React.useMemo(
		() => [
			{
				step: 0,
				type: 'sectors',
				title: 'Select a sector',
				description: 'Click on the tags to select a sector',
				deleteView: false,
				addView: false,
				next: 'typologies',
				previous: null,
			},
			{
				step: 1,
				type: 'typologies',
				title: 'Select a typology',
				description: 'Click on the tags to select a typology',
				deleteView: false,
				addView: false,
				next: 'locations',
				previous: 'sectors',
			},
			{
				step: 2,
				type: 'locations',
				title: 'Select a region',
				description:
					'Click here to add a region to the national call for applications.',
				deleteView: false,
				addView: true,
				next: 'results',
				previous: 'typologies',
			},
			{
				step: 3,
				type: 'results',
				title: 'Results',
				description: 'Click here to see the results of the search',
				deleteView: false,
				addView: false,
				next: null,
				previous: 'locations',
			},
		],
		[],
	);

	const initialStep = steps.find((step) => step.step === 0) as Step;
	const [activeStep, setActiveStep] =
		React.useState<Step>(initialStep);

	const navigate = useNavigate();
	const location = useLocation();
	const queryParams = React.useMemo(
		() => new URLSearchParams(location.search),
		[location.search],
	);

	const handleSetStep = React.useCallback(
		(
			type: StepType,
			deleteView: boolean = false,
			addView: boolean = false,
		) => {
			const step = steps.find((step) => step.type === type);
			if (step) {
				queryParams.set('step', step.type);
				if (deleteView) {
					queryParams.delete('view');
				}
				if (addView) {
					queryParams.set('view', 'table');
				}
				navigate(`?${queryParams.toString()}`);
				setActiveStep(step);
			}
		},
		[steps, queryParams, navigate],
	);

	React.useEffect(() => {
		const param = (queryParams.get('step') as StepType) || 'sectors';
		const stepFound = steps.find((step) => step.type === param);

		if (stepFound) {
			queryParams.set('step', stepFound.type);
			navigate(`?${queryParams.toString()}`);
			setActiveStep(stepFound);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<StepContext.Provider value={{ activeStep, handleSetStep }}>
			{children}
		</StepContext.Provider>
	);
};
