import { Col, Row } from 'antd';
import React from 'react';
import { Grant } from '../types';
import GrantCard from './grant-card';
import { userProfileData } from '../data';

export interface ResultsCardsProps {
	grants: Grant[];
}

const ResultsCards: React.FC<ResultsCardsProps> = (props) => {
	const { grants } = props;

	return (
		<Row gutter={[8, 8]} style={{ width: '100%' }}>
			{grants.map((item) => (
				<Col span={24}>
					<GrantCard
						key={item.id}
						grant={item}
						userProfile={userProfileData}
					/>
				</Col>
			))}
		</Row>
	);
};

export default ResultsCards;
