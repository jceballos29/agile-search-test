'use client';
import {
	AppstoreOutlined,
	CaretLeftOutlined,
	ExclamationCircleOutlined,
	LoadingOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Pagination,
	Spin,
	Steps,
	Tooltip,
	Typography,
} from 'antd';
import React from 'react';
import { AgileSearchResponse, UserProfile } from '../../types';
import {
	FilterManagement,
	Filters,
	Header,
	SelectCountry,
} from './components';
import { useFilters } from './hook/useFilters';
import { useStep } from './hook/useSteps';
import styles from './styles.module.css';
import { showTotal } from './utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResultsCards, TableResults } from '../../components';
import { useSearchGrant } from '../../hooks';

const { Text } = Typography;

export interface AgileSearchProps {
	userProfile: UserProfile;
}

const AgileSearch: React.FC = () => {
	const location = useLocation();
	const queryParams = React.useMemo(
		() => new URLSearchParams(location.search),
		[location.search],
	);
	const navigate = useNavigate();

	const [openParamsModal, setOpenParamsModal] = React.useState(false);
	const { activeStep, handleSetStep } = useStep();
	const { initializing } = useFilters();
	const {
		filters,
		page,
		pageSize,
		setPage,
		setPageSize,
		orderby,
		origin,
		initialize,
		setOpenInitialization,
	} = useFilters();
	const [resultsView, setResultsView] = React.useState<
		'cards' | 'table'
	>('table');

	React.useEffect(() => {
		const view = queryParams.get('view') as 'cards' | 'table';
		if (view) {
			setResultsView(view);
		}
	}, [queryParams]);

	const { data, loading, error, setParams, setShouldFetch } =
		useSearchGrant<AgileSearchResponse>(
			'/grants/search',
			filters,
			{
				page,
				pageSize,
				orderby,
				origin,
			},
			'',
			!initializing,
		);

	const handlePageChange = (page: number, pageSize?: number) => {
		setPage(page);
		setPageSize(pageSize || 20);
		setParams({
			page,
			pageSize: pageSize || 20,
			orderby,
			origin,
		});
	};

	const handleSetCountry = (country: string) => {
		initialize(country);
		setOpenInitialization(false);
		setShouldFetch(true);
	};

	return (
		<>
			<FilterManagement
				open={openParamsModal}
				onClose={() => setOpenParamsModal(false)}
			/>
			<SelectCountry handleSetCountry={handleSetCountry} />
			{!initializing ? (
				<div className={styles.agile_search}>
					<div className={styles.header}>
						<Header />
						{activeStep.step !== 3 && (
							<div className={styles.search_steps}>
								<Steps
									progressDot
									current={activeStep.step}
									items={[
										{
											title: 'Sector',
											onClick: () => handleSetStep('sectors'),
										},
										{
											title: 'Typology',
											onClick: () => handleSetStep('typologies'),
										},
										{
											title: 'Region',
											onClick: () => handleSetStep('locations'),
										},
									]}
								/>
							</div>
						)}
					</div>
					<div
						className={styles.body}
						style={{
							paddingLeft: activeStep.step === 3 ? 16 : 332,
						}}
					>
						<Filters />
						<div className={styles.results}>
							<Alert
								showIcon
								type='info'
								message='Agile search selects some parameters by default.'
								action={
									<Button
										type='link'
										onClick={() => setOpenParamsModal(true)}
									>
										Learn more
									</Button>
								}
								style={{ marginBottom: 16 }}
							/>
							<div className={styles.results_pagination}>
								<div className={styles.results_pagination_totals}>
									{activeStep.step === 3 ? (
										<>
											<Button
												onClick={() => {
													handleSetStep('locations', true);
													setResultsView('table');
												}}
												icon={<CaretLeftOutlined />}
											>
												Volver a la selección de comunidad autónoma
											</Button>
											<Button
												type={
													resultsView === 'table'
														? 'primary'
														: 'default'
												}
												icon={<UnorderedListOutlined />}
												onClick={() => {
													queryParams.set('view', 'table');
													navigate(`?${queryParams.toString()}`);
													setResultsView('table');
												}}
											/>
											<Button
												type={
													resultsView === 'cards'
														? 'primary'
														: 'default'
												}
												icon={<AppstoreOutlined />}
												onClick={() => {
													queryParams.set('view', 'cards');
													navigate(`?${queryParams.toString()}`);
													setResultsView('cards');
												}}
											/>
										</>
									) : (
										<>
											<Text>
												{showTotal(page, pageSize, data?.count || 0)}
											</Text>
											<Tooltip title='Distinctively monetize cost effective networks for cross-media bandwidth'>
												<ExclamationCircleOutlined />
											</Tooltip>
										</>
									)}
								</div>
								<Pagination
									showSizeChanger
									defaultCurrent={1}
									total={data?.count || 0}
									pageSizeOptions={['10', '20', '50', '100']}
									onChange={handlePageChange}
									onShowSizeChange={handlePageChange}
									current={page}
									pageSize={pageSize}
								/>
							</div>
							<div className={styles.grants}>
								{loading && (
									<div
										style={{
											display: 'flex',
											flexGrow: 1,
											justifyContent: 'center',
											alignItems: 'center',
											height: '100%',
											width: '100%',
										}}
									>
										<Spin
											indicator={
												<LoadingOutlined
													style={{ fontSize: 48 }}
													spin
												/>
											}
										/>
									</div>
								)}
								{!loading && error && (
									<Alert
										message='Error'
										description='There was an error loading the data'
										type='error'
									/>
								)}
								{!loading && !error && data && (
									<>
										{resultsView === 'cards' ? (
											<ResultsCards grants={data.items} />
										) : (
											<TableResults grants={data.items} />
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div
					style={{
						display: 'flex',
						flexGrow: 1,
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
						width: '100%',
					}}
				>
					<Spin
						indicator={
							<LoadingOutlined style={{ fontSize: 48 }} spin />
						}
					/>
				</div>
			)}
		</>
	);
};

export default AgileSearch;
