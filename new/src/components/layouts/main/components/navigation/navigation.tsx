import {
	CalendarOutlined,
	HeartOutlined,
	HistoryOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Space, theme, Typography } from 'antd';
import React from 'react';
import styles from './styles.module.css';
import { NavLink } from 'react-router-dom';

const { Title } = Typography;
const { useToken } = theme;

const Navigation: React.FC = () => {
	const { token } = useToken();

	const navigation = [
		{
			key: 'searcher',
			to: '/',
			name: 'Searcher',
			Icon: SearchOutlined,
		},
		{
			key: 'calendar',
			to: '/calendar',
			name: 'Calendar',
			Icon: CalendarOutlined,
		},
		{
			key: 'favorites',
			to: '/favorites',
			name: 'Favorites',
			Icon: HeartOutlined,
		},
		{
			key: 'history',
			to: '/history',
			name: 'History',
			Icon: HistoryOutlined,
		},
	];

	return (
		<nav className={styles.nav}>
			<Title
				level={2}
				style={{ marginBottom: 0, color: token.colorPrimary }}
			>
				Grants Searcher
			</Title>
			<Space>
				{navigation.map(({ Icon, key, name, to }) => (
					<NavLink key={key} to={to}>
						{({ isActive }) => (
							<Button
								key={key}
									type={isActive ? 'primary' : 'default'}
								icon={<Icon style={{ color: isActive ? 'white' : token.colorPrimary }} />}
							>
								{name}
							</Button>
						)}
					</NavLink>
				))}
			</Space>
		</nav>
	);
};

export default Navigation;
