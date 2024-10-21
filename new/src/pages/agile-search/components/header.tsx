import {
	CaretLeftOutlined,
	ExclamationCircleOutlined,
	FilterOutlined,
} from '@ant-design/icons';
import {
	Button,
	Popover,
	Space,
	theme,
	Tooltip,
	Typography,
} from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { showTotal } from '../utils';
import { response } from '../../../data';
import { useStep } from '../hook/useSteps';
import { useFilters } from '../hook/useFilters';

const { Title, Text } = Typography;
const { useToken } = theme;

const Header: React.FC = () => {
	const { token } = useToken();
	const navigate = useNavigate();
	const { activeStep } = useStep();
	const { filters, resetFilters, page, pageSize } = useFilters();

	const [openSummary, setOpenSummary] = React.useState(false);

	return (
		<div className={styles.header_nav}>
			<Button
				className={styles.header_nav_back_button}
				onClick={() => navigate('/')}
				icon={<CaretLeftOutlined />}
				type='text'
			>
				Back to normal search
			</Button>
			<Title
				className={styles.header_nav_central_title}
				style={{ color: token.colorPrimary }}
				level={2}
			>
				{activeStep.step === 3 ? (
					<>
						<span style={{ marginRight: 10 }}>
							{showTotal(page, pageSize, response.count)}
						</span>
						<Tooltip title='Distinctively monetize cost effective networks for cross-media bandwidth'>
							<ExclamationCircleOutlined style={{ fontSize: 18 }} />
						</Tooltip>
					</>
				) : (
					activeStep.title
				)}
			</Title>
			<Popover
				placement='leftTop'
				title={<Title level={4}>Filters applied</Title>}
				trigger='click'
				open={openSummary}
				onOpenChange={(visible) => setOpenSummary(visible)}
				className={styles.header_nav_resume_button}
				content={
					<Space
						direction='vertical'
						size='large'
						style={{ width: '100%' }}
					>
						<Space direction='vertical' size={[8, 2]}>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Countries:</Text>
								<Text type='secondary'>
									{filters.countries.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Sectors:</Text>
								<Text type='secondary'>
									{filters.sectors.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Typologies:</Text>
								<Text type='secondary'>
									{filters.typologies.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Regions:</Text>
								<Text type='secondary'>
									{filters.locations.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Annuities:</Text>
								<Text type='secondary'>
									{filters.annuities.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Categories:</Text>
								<Text type='secondary'>
									{filters.category.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Target Sectors:</Text>
								<Text type='secondary'>
									{filters.targetSectors
										.map((c) => c.name)
										.join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Status:</Text>
								<Text type='secondary'>
									{filters.status.map((c) => c.name).join(', ')}
								</Text>
							</Space>
							<Space direction='horizontal' size='small'>
								<Text strong={true}>Minimis:</Text>
								<Text type='secondary'>{filters.minimis?.name}</Text>
							</Space>
						</Space>
						<div
							style={{
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
							}}
						>
							<Button
								type='link'
								onClick={() => {
									setOpenSummary(false);
									resetFilters();
								}}
							>
								Reset filters
							</Button>
						</div>
					</Space>
				}
			>
				<Button
					icon={
						<FilterOutlined style={{ color: token.colorPrimary }} />
					}
				/>
			</Popover>
		</div>
	);
};

export default Header;
