import React from 'react';
import styles from '../styles.module.css';
import {
	Button,
	Checkbox,
	Select,
	Space,
	theme,
	Tooltip,
	Typography,
} from 'antd';
import {
	AppstoreOutlined,
	QuestionCircleOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { userProfileData } from '../../../data';
import { Filters as FiltersType } from '../../../types';

export interface FiltersProps {
	setFilters: (filters: FiltersType) => void;
}

export interface FiltersParams {
	countries: string[];
	locations: string[];
	annuities: string[];
	typologies: string[];
	sectors: string[];
	targetSectors: string[];
	categories: string[];
	beneficiaryTypes: string[];
	minimis: string | undefined;
	status: string[];
}

const { useToken } = theme;
const { Text } = Typography;

const categories = [
	{ id: 1, name: 'Very important call', type: 'A' },
	{ id: 2, name: 'Important call', type: 'B' },
	{ id: 3, name: 'Reactive call', type: 'C' },
	{ id: 4, name: 'Call not for companies', type: 'D' },
	{
		id: 5,
		name: "FI doesn't work this call",
		type: 'E',
	},
];

const statuses = [
	{ id: 0, name: 'Closed' },
	{ id: 1, name: 'Open' },
	{ id: 2, name: 'Pending publication' },
];

const minimises = [
	{ id: 0, name: 'No' },
	{ id: 1, name: 'Yes' },
];

const Filters: React.FC<FiltersProps> = (props) => {
	const { setFilters } = props;

	const { token } = useToken();
	const location = useLocation();
	const queryParams = React.useMemo(
		() => new URLSearchParams(location.search),
		[location.search],
	);
	const navigate = useNavigate();

	const [resultsView, setResultsView] = React.useState<
		'table' | 'cards'
	>('table');
	const [selects, setSelects] = React.useState<FiltersParams>({
		countries: [],
		locations: [],
		annuities: [],
		typologies: [],
		sectors: [],
		targetSectors: [],
		beneficiaryTypes: [],
		categories: [],
		status: [],
		minimis: undefined,
	});

	const handleApplyFilters = () => {
		setFilters({
			countries: userProfileData.countries.filter((country) =>
				selects.countries.includes(country.code),
			),
			locations: userProfileData.locations.filter((location) =>
				selects.locations.includes(location.id.toString()),
			),
			annuities: userProfileData.annuities.filter((annuity) =>
				selects.annuities.includes(annuity.id.toString()),
			),
			typologies: userProfileData.typologies.filter((typology) =>
				selects.typologies.includes(typology.id.toString()),
			),
			sectors: userProfileData.sectors.filter((sector) =>
				selects.sectors.includes(sector.id.toString()),
			),
			targetSectors: userProfileData.targetSectors.filter((sector) =>
				selects.targetSectors.includes(sector.id.toString()),
			),
			category: categories.filter((category) =>
				selects.categories.includes(category.id.toString()),
			),
			beneficiaryTypes: userProfileData.beneficiaryTypes.filter(
				(type) =>
					selects.beneficiaryTypes.includes(type.id.toString()),
			),
			status: statuses.filter((status) =>
				selects.status.includes(status.id.toString()),
			),
			minimis: minimises.find(
				(minimis) => minimis.id.toString() === selects.minimis,
			),
		});
	};

	React.useEffect(() => {
		const view = queryParams.get('view') as 'cards' | 'table';
		if (view) {
			setResultsView(view);
		} else {
			queryParams.set('view', resultsView);
			navigate({ search: queryParams.toString() });
			setResultsView('table');
		}
	}, [navigate, queryParams, resultsView]);

	return (
		<div className={styles.filters}>
			<div className={styles.filters_content}>
				<Space
					direction='horizontal'
					size='small'
					style={{
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 16,
					}}
				>
					<Space direction='horizontal' size='small'>
						<Button
							type='primary'
							onClick={() => handleApplyFilters()}
						>
							Apply filters
						</Button>
						<Button
							type='link'
							onClick={() => {
								setFilters({} as FiltersType);
								setSelects({
									countries: [],
									locations: [],
									annuities: [],
									typologies: [],
									sectors: [],
									targetSectors: [],
									categories: [],
									beneficiaryTypes: [],
									status: [],
									minimis: undefined,
								});
							}}
						>
							Clear
						</Button>
					</Space>
					<Space
						direction='horizontal'
						size='small'
						style={{ marginLeft: 'auto' }}
					>
						<Button
							icon={
								<UnorderedListOutlined
									style={{
										color:
											resultsView === 'table'
												? token.colorPrimary
												: token.colorTextDisabled,
									}}
								/>
							}
							style={{
								borderColor:
									resultsView === 'table'
										? token.colorPrimary
										: token.colorTextDisabled,
							}}
							onClick={() => {
								queryParams.set('view', 'table');
								navigate({ search: queryParams.toString() });
								setResultsView('table');
							}}
						/>
						<Button
							icon={
								<AppstoreOutlined
									style={{
										color:
											resultsView === 'cards'
												? token.colorPrimary
												: token.colorTextDisabled,
									}}
								/>
							}
							style={{
								borderColor:
									resultsView === 'cards'
										? token.colorPrimary
										: token.colorTextDisabled,
							}}
							onClick={() => {
								queryParams.set('view', 'cards');
								navigate({ search: queryParams.toString() });
								setResultsView('cards');
							}}
						/>
					</Space>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Country</Text>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.countries}
							onChange={(value: string[]) =>
								setSelects({ ...selects, countries: value })
							}
							options={userProfileData.countries.map((country) => ({
								value: country.code,
								label: country.name,
								flag: country.icon,
							}))}
              // TODO: Add flag icon to the select options
						/>
					</Space>
					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Region</Text>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.locations}
							onChange={(value: string[]) =>
								setSelects({ ...selects, locations: value })
							}
							options={
								selects.countries.length === 0
									? userProfileData.locations.map((location) => ({
											value: location.id,
											label: location.name,
									  }))
									: userProfileData.locations
											.filter(
												(location) =>
													location.countryCode &&
													selects.countries.includes(
														location.countryCode,
													),
											)
											.map((location) => ({
												value: location.id,
												label: location.name,
											}))
							}
              // TODO: Add flag icon to the select options
						/>
					</Space>

					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Annuity</Text>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.annuities}
							onChange={(value: string[]) =>
								setSelects({ ...selects, annuities: value })
							}
							options={userProfileData.annuities.map((country) => ({
								value: country.id,
								label: country.name,
							}))}
						/>
					</Space>

					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Text>Typology</Text>
							<Tooltip title='Search for grants by title, description, or other keywords'>
								<QuestionCircleOutlined
									style={{
										fontSize: 14,
										color: token.colorTextSecondary,
									}}
								/>
							</Tooltip>
						</div>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.typologies}
							onChange={(value: string[]) =>
								setSelects({ ...selects, typologies: value })
							}
							options={userProfileData.typologies.map((country) => ({
								value: country.id,
								label: country.name,
							}))}
						/>
					</Space>

					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Text>Sector</Text>
							<Tooltip title='Search for grants by title, description, or other keywords'>
								<QuestionCircleOutlined
									style={{
										fontSize: 14,
										color: token.colorTextSecondary,
									}}
								/>
							</Tooltip>
						</div>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.sectors}
							onChange={(value: string[]) =>
								setSelects({ ...selects, sectors: value })
							}
							options={userProfileData.sectors.map((country) => ({
								value: country.id,
								label: country.name,
							}))}
						/>
					</Space>

					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Text>Priority Sector</Text>
							<Tooltip title='Search for grants by title, description, or other keywords'>
								<QuestionCircleOutlined
									style={{
										fontSize: 14,
										color: token.colorTextSecondary,
									}}
								/>
							</Tooltip>
						</div>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.targetSectors}
							onChange={(value: string[]) =>
								setSelects({ ...selects, targetSectors: value })
							}
							options={userProfileData.targetSectors.map(
								(category) => ({
									value: category.id,
									label: category.name,
								}),
							)}
						/>
					</Space>


					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Beneficiary Type</Text>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.beneficiaryTypes}
							onChange={(value: string[]) =>
								setSelects({ ...selects, beneficiaryTypes: value })
							}
							options={userProfileData.beneficiaryTypes.map(
								(category) => ({
									value: category.id,
									label: category.name,
								}),
							)}
						/>
					</Space>
					
					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Category</Text>
						<Select
							mode='multiple'
							allowClear
							style={{ width: '100%' }}
							placeholder='Please select'
							value={selects.categories}
							onChange={(value: string[]) =>
								setSelects({ ...selects, categories: value })
							}
							options={categories.map((category) => ({
								value: category.id,
								label: category.name,
							}))}
						/>
					</Space>
					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Status</Text>
						<Checkbox.Group
							options={statuses.map((status) => ({
								label: status.name,
								value: status.id.toString(),
							}))}
							value={selects.status}
							onChange={(value) =>
								setSelects({ ...selects, status: value })
							}
						/>
					</Space>
					<Space
						direction='vertical'
						size='small'
						style={{ width: '100%' }}
					>
						<Text>Minimis</Text>
						<Space direction='horizontal'>
							{[
								{ id: 0, name: 'No' },
								{ id: 1, name: 'Yes' },
							].map((status) => (
								<Checkbox
									key={status.id}
									value={status.id.toString()}
									checked={selects.minimis === status.id.toString()}
									onChange={(e) => {
										setSelects({
											...selects,
											minimis: e.target.checked
												? status.id.toString()
												: undefined,
										});
									}}
								>
									{status.name}
								</Checkbox>
							))}
						</Space>
					</Space>
				</Space>
			</div>
		</div>
	);
};

export default Filters;
