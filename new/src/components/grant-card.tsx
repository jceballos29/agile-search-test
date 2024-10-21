import React from 'react';
import { Grant, UserProfile } from '../types';
import {
	Button,
	Card,
	Col,
	Row,
	Space,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import {
	StarFilled,
	StarOutlined,
	VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export interface GrantCardProps {
	grant: Grant;
	userProfile: UserProfile;
}

const GrantCard: React.FC<GrantCardProps> = (props) => {
	const { grant, userProfile } = props;

	return (
		<Card bodyStyle={{ padding: 12 }}>
			<Row gutter={[16, 16]}>
				<Col span={2}  >
					<Tag
						color={
							grant.status === 'Open'
								? 'success'
								: grant.status === 'error'
								? 'processing'
								: 'default'
						}
						style={{
							width: '100%',
							display: 'flex',
							justifyContent: 'center',
							marginBottom: 8,
						}}
					>
						{grant.status}
					</Tag>
					<figure
						style={{
							margin: 0,
							width: '100%',
							aspectRatio: '1/1',
							overflow: 'hidden',
							borderRadius: '50%',
							objectFit: 'cover',
							backgroundColor: '#f0f0f0',
						}}
					>
						{/* <img src={grantCardImg} alt="Grant Card" style={{ width: '100%' }} /> */}
					</figure>
				</Col>
				<Col span={17}>
					<Space
						size={0}
						direction='horizontal'
						style={{ marginBottom: 8 }}
					>
            {
              grant.annuities.map((annuity) => (
                <Tag key={annuity} color='red'>
                  {
                    userProfile.annuities.find((a) => a.id === annuity)?.name
                  }
                </Tag>
              ))
            }
						{grant.periods && grant.periods.length > 0 && (
							<Tag color='volcano'>
								Closing Date{' '}
								{
									grant.periods[
										grant.periods.length - 1
									].closingDate.split('T')[0]
								}
							</Tag>
						)}
						<Tag color='magenta'>
							{
								userProfile.countries.find(
									(c) => c.code === grant.countryId,
								)?.name
							}
						</Tag>
						{grant.locations && grant.locations.length > 0 && (
							<Tag color='gold'>
								{
									userProfile.locations.find(
										(l) => l.id === grant.locations[0],
									)?.name
								}
							</Tag>
						)}
					</Space>
					<Title level={5}>
						<Link to={`/search/${grant.id}`}>{grant.title}</Link>
					</Title>
					<Paragraph ellipsis={{ rows: 2 }}>{grant.scope}</Paragraph>
					<Space wrap direction='vertical'>
						<Space wrap direction='horizontal' size={0}>
							{grant.typologies.map((sector) => (
								<Tag key={sector} color='purple'>
									{
										userProfile.typologies.find(
											(s) => s.id === sector,
										)?.name
									}
								</Tag>
							))}
						</Space>
						<Space wrap direction='horizontal' size={0}>
							{grant.sectors.map((sector) => (
								<Tag key={sector} color='default'>
									{
										userProfile.sectors.find((s) => s.id === sector)
											?.name
									}
								</Tag>
							))}
						</Space>
					</Space>
				</Col>
				<Col span={5}>
					<Space size={0} direction='horizontal'  style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
						<Tooltip
							title={
								grant.isFavorite
									? 'Remove from favorites'
									: 'Add to favorites'
							}
						>
							<Button
								type='text'
								icon={
									grant.isFavorite ? <StarFilled /> : <StarOutlined />
								}
							/>
						</Tooltip>
						<Tooltip title='Download ID Card'>
							<Button
								type='text'
								icon={<VerticalAlignBottomOutlined />}
							/>
						</Tooltip>
					</Space>
					<Space wrap size={[0, 8]}>
						{grant.beneficiaryTypesId.map((beneficiaryType) => (
							<Tag key={beneficiaryType} color='cyan'>
								{
									userProfile.beneficiaryTypes.find(
										(b) => b.id === beneficiaryType,
									)?.name
								}
							</Tag>
						))}
					</Space>
				</Col>
			</Row>
		</Card>
	);
};

export default GrantCard;
