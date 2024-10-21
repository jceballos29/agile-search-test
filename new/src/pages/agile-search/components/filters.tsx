import React from 'react';
import styles from '../styles.module.css';
import { Alert, Button, Space, Tag } from 'antd';
import {
	Location,
	Sector,
	Typology,
} from '../../../types';

import { useFilters } from '../hook/useFilters';
import { useStep } from '../hook/useSteps';

const Filters: React.FC = () => {
	const { activeStep, handleSetStep } = useStep();
	const { filters, options, toggleFilter } = useFilters();

	const tags: Sector[] | Typology[] | Location[] =
		React.useMemo(() => {
			switch (activeStep.type) {
				case 'sectors':
					return options.sectors;
				case 'typologies':
					return options.typologies;
				case 'locations':
					return options.locations.filter(
						(location) =>
							location.countryCode &&
							filters.countries
								.map((c) => c.code)
								.includes(location.countryCode),
					);
				default:
					return [];
			}
		}, [
			activeStep.type,
			filters.countries,
			options.locations,
			options.sectors,
			options.typologies,
		]);

	return (
		<aside
			className={styles.filters}
			style={{
				width: activeStep.step === 3 ? 0 : 316,
				visibility: activeStep.step === 3 ? 'hidden' : 'visible',
				opacity: activeStep.step === 3 ? 0 : 1,
			}}
		>
			<Alert message={activeStep.description} type='info' />
			<div className={styles.filters_tags}>
				<Space wrap size={[0, 6]}>
					{tags.map((tag) => (
						<Tag
							key={tag.id}
							color={
								[
									...filters[
										activeStep.type as
											| 'sectors'
											| 'typologies'
											| 'locations'
									],
								].findIndex((f) => f.id === tag.id) !== -1
									? 'blue'
									: 'default'
							}
							style={{ cursor: 'pointer' }}
							onClick={() =>
								toggleFilter(
									activeStep.type as
										| 'sectors'
										| 'typologies'
										| 'locations',
									tag,
								)
							}
						>
							{tag.name}
						</Tag>
					))}
				</Space>
			</div>
			<div className={styles.filters_actions}>
				<Button
					block
					disabled={activeStep.previous === null}
					onClick={() =>
						handleSetStep(
							activeStep.previous ? activeStep.previous : 'sectors',
						)
					}
				>
					Back
				</Button>
				<Button
					block
					disabled={activeStep.next === null}
					onClick={() =>
						handleSetStep(
							activeStep.next ? activeStep.next : 'results',
							activeStep.deleteView,
							activeStep.addView,
						)
					}
					type='primary'
				>
					Continue
				</Button>
			</div>
		</aside>
	);
};

export default Filters;
