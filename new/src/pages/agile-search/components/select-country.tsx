import { Button, Modal, Select, Space, Typography } from 'antd';
import React from 'react';
import { useFilters } from '../hook/useFilters';

const { Text } = Typography;

export interface SelectCountryProps {
	handleSetCountry: (country: string) => void;
}

const SelectCountry: React.FC<SelectCountryProps> = (props) => {
	const { handleSetCountry } = props;

	const { openInitialization, options } = useFilters();

	const [country, setCountry] = React.useState<string>('');

	const handleOk = () => {
		handleSetCountry(country);
		setCountry('');
	};

	return (
		<Modal
			title='Select a country'
			centered
			closable={false}
			open={openInitialization}
			footer={[
				<Button
					key='save'
					type='primary'
					disabled={!country}
					onClick={() => handleOk()}
				>
					Save
				</Button>,
			]}
		>
			<Space direction='vertical' style={{ width: '100%' }}>
				<Text>Please select a country to begin your search.</Text>
				<Select
					style={{ width: '100%' }}
					placeholder='Select a country'
					onChange={(value) => setCountry(value)}
					options={options.countries.map((country) => ({
						value: country.code,
						label: country.name,
					}))}
				/>
			</Space>
		</Modal>
	);
};

export default SelectCountry;
