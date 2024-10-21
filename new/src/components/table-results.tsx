import {
	EyeOutlined,
	MoreOutlined,
	StarFilled,
	StarOutlined,
	VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Dropdown,
	Space,
	Table,
	TableProps,
	Tag,
	theme,
	Tooltip,
} from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grant } from '../types';

const { useToken } = theme;

export interface TableResultsProps {
	grants: Grant[];
}

const TableResults: React.FC<TableResultsProps> = (props) => {
	const { grants } = props;
	const navigate = useNavigate();
  const { token } = useToken();

	const columns:TableProps<Grant>['columns'] = [
		{
			title: '',
			dataIndex: 'isFavorite',
			key: 'isFavorite',
			width: 48,
			align: 'center',
			render: (isFavorite: boolean) => (
				<Space>
					<Tooltip
						title={
							isFavorite
								? 'Remove from favorites'
								: 'Add to favorites'
						}
					>
						<Button
							type='text'
							icon={isFavorite ? <StarFilled /> : <StarOutlined />}
						/>
					</Tooltip>
				</Space>
			),
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			render: (title: string, record: Grant) => (
				<Link
					to={`/search/${record.id}`}
					style={{ color: '#0000A4' }}
				>
					{title}
				</Link>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			width: 120,
			render: (status: string) => (
				<Badge
					status={
						status === 'Open'
							? 'success'
							: status === 'Closed'
							? 'processing'
							: 'default'
					}
					text={status}
				/>
			),
		},
		{
			title: 'Closing',
			key: 'closingDate',
			align: 'center',
			width: 120,
			render: (_: string, record: Grant) => {
				if (record.periods && record.periods.length > 0) {
					return (
						<Tag color='volcano' style={{ margin: 0 }}>
							{
								record.periods[
									record.periods.length - 1
								].closingDate.split('T')[0]
							}
						</Tag>
					);
				}
				return null;
			},
		},
		{
			title: '',
			key: 'actions-grants',
			align: 'center',
			width: 48,
			render: (_: string, record: Grant) => (
				<Space wrap>
					<Dropdown
						trigger={['click']}
						menu={{
							items: [
								{
									label: 'See details',
									key: 'details',
									icon: <EyeOutlined style={{ color: token.colorPrimary }} />,
									onClick: () => navigate(`/search/${record.id}`),
								},
								{
									label: 'Download ID Card',
									key: 'download',
									icon: (
										<VerticalAlignBottomOutlined
											style={{ color: token.colorPrimary }}
										/>
									),
									// onClick: async () => {
									//   const result = await httpService.get(`api/v1/grants/grantSlide/${record.id}`, {
									//     responseType: 'arraybuffer',
									//   });
									//   const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
									//   (FileSaver as any).saveAs(blob, `${record.title}.pptx`);
									// },
								},
							],
						}}
					>
						<Button type='text' icon={<MoreOutlined />} />
					</Dropdown>
				</Space>
			),
		},
	];

	return (
		<Table
			rowKey={(record: Grant) => record.id}
			columns={columns}
			dataSource={grants}
			pagination={false}
			size='middle'
		/>
	);
};

export default TableResults;
