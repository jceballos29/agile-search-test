import { Col, Row } from 'antd';
import React from 'react';
import { response } from '../data';
import GrantCard from './grant-card';

export interface ResultsCardsProps {}

const ResultsCards: React.FC<ResultsCardsProps> = () => {
  return (
    <Row gutter={[8, 8]} style={{ width: '100%' }}>
      {response.items.map((item: any) => (
        <Col span={24}>
          <GrantCard key={item.id} grant={item} />
        </Col>
      ))}
    </Row>
  );
};

export default ResultsCards;
