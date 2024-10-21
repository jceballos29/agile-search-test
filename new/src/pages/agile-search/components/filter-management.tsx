import {
	Button,
	Checkbox,
	Modal,
	Select,
	Space,
	Typography,
} from 'antd';
import React from 'react';
import { useFilters } from '../hook/useFilters';

const { Paragraph, Text } = Typography;

export interface FilterManagementProps {
	open: boolean;
	onClose: () => void;
}

export interface FilterManagementState {
	annuities: string[];
	categories: string[];
	countries: string[];
	minimis: string | undefined;
	status: string[];
	beneficiaryTypes: string[];
	targetSectors: string[];
}

const FilterManagement: React.FC<FilterManagementProps> = (props) => {
	const { open, onClose } = props;

	const { filters, options, updateFilters } = useFilters();
	const [selects, setSelects] = React.useState<FilterManagementState>(
		{
			countries: filters.countries.map((country) => country.code),
			annuities: [],
			categories: [],
			beneficiaryTypes: [],
			targetSectors: [],
			status: [],
			minimis: undefined,
		},
	);

	const handleOk = () => {
		updateFilters({
			...filters,
			countries: options.countries.filter((country) =>
				selects.countries.includes(country.code),
			),
			annuities: options.annuities.filter((annuity) =>
				selects.annuities.includes(annuity.id.toString()),
			),
			category: options.categories.filter((category) =>
				selects.categories.includes(category.id.toString()),
			),
			status: options.status.filter((status) =>
				selects.status.includes(status.id.toString()),
			),
			minimis: options.minimis.find(
				(minimis) => minimis.id.toString() === selects.minimis,
			),
		});
		onClose();
	};

	React.useEffect(() => {
		setSelects({
			countries: filters.countries.map((country) => country.code),
			annuities: filters.annuities.map((annuity) =>
				annuity.id.toString(),
			),
			categories: filters.category.map((category) =>
				category.id.toString(),
			),
			beneficiaryTypes: filters.beneficiaryTypes.map((type) =>
				type.id.toString(),
			),
			targetSectors: filters.targetSectors.map((sector) =>
				sector.id.toString(),
			),
			status: filters.status.map((status) => status.id.toString()),
			minimis: filters.minimis
				? filters.minimis.id.toString()
				: undefined,
		});
	}, [filters]);

	return (
		<Modal
			title='Manage default filters - agile search'
			open={open}
			onCancel={() => onClose()}
			footer={[
				<Button key='cancel' onClick={() => onClose()}>
					Cancel
				</Button>,
				<Button key='save' type='primary' onClick={() => handleOk()}>
					Save
				</Button>,
			]}
		>
			<Paragraph>
				Agile search automatically applies criteria to facilitate the
				search process. You can modify them to meet your needs.
			</Paragraph>
			<Space
				style={{ width: '100%', padding: 16 }}
				direction='vertical'
				size={[8, 8]}
			>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Country</Text>
					<Select
						mode='multiple'
						allowClear
						style={{ width: '100%' }}
						placeholder='Please select'
						value={selects.countries}
						onChange={(value: string[]) =>
							setSelects({ ...selects, countries: value })
						}
						options={options.countries.map((country) => ({
							value: country.code,
							label: country.name,
						}))}
					/>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Annuity</Text>
					<Select
						mode='multiple'
						allowClear
						style={{ width: '100%' }}
						placeholder='Please select'
						value={selects.annuities}
						onChange={(value: string[]) =>
							setSelects({ ...selects, annuities: value })
						}
						options={options.annuities.map((country) => ({
							value: country.id,
							label: country.name,
						}))}
					/>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Priority Sector</Text>
					<Select
						mode='multiple'
						allowClear
						style={{ width: '100%' }}
						placeholder='Please select'
						value={selects.targetSectors}
						onChange={(value: string[]) =>
							setSelects({ ...selects, targetSectors: value })
						}
						options={options.targetSectors.map((category) => ({
							value: category.id,
							label: category.name,
						}))}
					/>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Beneficiary Type</Text>
					<Select
						mode='multiple'
						allowClear
						style={{ width: '100%' }}
						placeholder='Please select'
						value={selects.beneficiaryTypes}
						onChange={(value: string[]) =>
							setSelects({ ...selects, beneficiaryTypes: value })
						}
						options={options.beneficiaryTypes.map((category) => ({
							value: category.id,
							label: category.name,
						}))}
					/>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Category</Text>
					<Select
						mode='multiple'
						allowClear
						style={{ width: '100%' }}
						placeholder='Please select'
						value={selects.categories}
						onChange={(value: string[]) =>
							setSelects({ ...selects, categories: value })
						}
						options={options.categories.map((category) => ({
							value: category.id,
							label: category.name,
						}))}
					/>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Status</Text>
					<Checkbox.Group
						options={options.status.map((status) => ({
							label: status.name,
							value: status.id.toString(),
						}))}
						value={selects.status}
						onChange={(value) =>
							setSelects({ ...selects, status: value })
						}
					/>
				</Space>
				<Space
					direction='vertical'
					size='small'
					style={{ width: '100%' }}
				>
					<Text>Minimis</Text>
					<Space direction='horizontal'>
						{options.minimis.map((status) => (
							<Checkbox
								key={status.id}
								value={status.id.toString()}
								checked={selects.minimis === status.id.toString()}
								onChange={(e) => {
									setSelects({
										...selects,
										minimis: e.target.checked
											? status.id.toString()
											: undefined,
									});
								}}
							>
								{status.name}
							</Checkbox>
						))}
					</Space>
				</Space>
			</Space>
			<Text type='secondary'>
				<span style={{ fontSize: 11, lineHeight: 1 }}>
					* This setting will be applied by default whenever you use
					the quick search option.
				</span>
			</Text>
		</Modal>
	);
};

export default FilterManagement;
