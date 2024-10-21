"use client";
import { Col, Row } from 'antd';
import React from 'react';

export interface CardsResultsProps {
	grants: any;
}

const CardsResults: React.FC<CardsResultsProps>  = ({grants}) => {
	return (
		<Row gutter={[8, 8]} style={{ width: '100%' }}>
      {grants.map((item: any) => (
        <Col span={24}>
          {/* <GrantCard key={item.id} grant={item} /> */}
        </Col>
      ))}
    </Row>
	);
};

export default CardsResults;
