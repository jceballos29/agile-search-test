import React from 'react';
import styles from './styles.module.css';
import { Grant as GrantType } from '../../types';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';
import { useApi } from '../../hooks/use-api';

const { Title } = Typography;

const Grant: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	const { cancelRequest, error, loading, data, refetch } = useApi<GrantType>(
		`/grants/search/${id}`,
		false,
	);

	React.useEffect(() => {
		if (id) {
			refetch();
		}
		return () => cancelRequest();
	}, [id]);

	return (
		<div className={styles.grant}>
			{loading && <p>Loading...</p>}
			{error && <p>Error fetching grant</p>}
			{data && (
				<div className={styles.header}>
					<Title level={3}>Grant {data.title}</Title>
				</div>
			)}
		</div>
	);
};

export default Grant;
