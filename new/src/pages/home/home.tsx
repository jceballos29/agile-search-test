import React from 'react';
import styles from './styles.module.css';
import { Filters } from './components';
import {
	Alert,
	Button,
	Input,
	Pagination,
	Spin,
	theme,
	Tooltip,
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchGrant } from '../../hooks';
import {
	AgileSearchResponse,
	Filters as FiltersType,
} from '../../types';
import {
	LoadingOutlined,
	QuestionCircleOutlined,
} from '@ant-design/icons';
import { ResultsCards, TableResults } from '../../components';

const { Search } = Input;
const { useToken } = theme;

const Home: React.FC = () => {

	const { token } = useToken();
	const navigate = useNavigate();
	const location = useLocation();
	const queryParams = React.useMemo(
		() => new URLSearchParams(location.search),
		[location.search],
	);
	const [resultsView, setResultsView] = React.useState<
		'cards' | 'table'
	>('table');
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);
	const [orderby] = React.useState(
		'category asc,publicationDate desc',
	);
	const [filters, setFilters] = React.useState<FiltersType>(
		{} as FiltersType,
	);
	const [origin] = React.useState('search');
	const [search, setSearch] = React.useState('');

	const { data, loading, error, setParams } =
		useSearchGrant<AgileSearchResponse>(
			'/grants/search',
			filters,
			{
				page,
				pageSize,
				orderby,
				origin,
			},
			search,
			true,
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

	React.useEffect(() => {
		const view = queryParams.get('view') as 'cards' | 'table';
		if (view) {
			setResultsView(view);
		}
	}, [queryParams]);

	return (
		<div className={styles.home}>
			<div className={styles.body}>
				<Filters setFilters={setFilters} />
				<div className={styles.results}>
					<Alert
						showIcon
						type='info'
						message='New Agile Search'
						description='Map out general opportunities to present to your clients!'
						action={
							<Button
								type='primary'
								onClick={() => navigate('agile-search')}
							>
								Try Agile Search
							</Button>
						}
						style={{ marginBottom: 16 }}
					/>
					<div className={styles.results_pagination}>
						<Search
							allowClear
							placeholder='input search text'
							onSearch={(value) => setSearch(value)}
							style={{ width: 400 }}
							suffix={
								<Tooltip title='Search for grants by title, description, or other keywords'>
									<QuestionCircleOutlined style={{ color: token.colorTextSecondary}} />
								</Tooltip>
							}
						/>
						<Pagination
							showSizeChanger
							defaultCurrent={1}
							total={data?.count || 0}
							showTotal={(total: number, range: [number, number]) =>
								`${range[0]} to ${range[1]} of ${total} items`
							}
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
										<LoadingOutlined style={{ fontSize: 48 }} spin />
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
	);
};

export default Home;
