import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './styles.module.css';
import { Navigation } from './components';

const Main: React.FC = () => {
	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<Navigation />
				<Outlet />
			</div>
		</main>
	);
};

export default Main;
