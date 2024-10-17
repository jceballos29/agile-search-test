import { Button, Checkbox, Col, Divider, Modal, Row, Select, Space, Typography } from 'antd';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { Filters, FiltersOptions } from '../agile-search';

const { Paragraph, Text } = Typography;

export interface FilterManagementProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {
  onCancel: () => void;
  filters: Filters;
  handleChanges: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterManagement: React.FC<FilterManagementProps> = (props) => {
  const { t, filters, userProfile, handleChanges } = props;

  const [selectedCountries, setSelectedCountries] = React.useState<any[]>([]);
  const [selectedAnnuities, setSelectedAnnuities] = React.useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<any[]>([]);
  const [selectedTargetSectors, setSelectedTargetSectors] = React.useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = React.useState<any[]>([]);
  const [selectedMinimis, setSelectedMinimis] = React.useState<any[]>([]);

  const categoryOptions = [
    { id: 1, name: 'Very important call', type: 'A' },
    { id: 2, name: 'Important call', type: 'B' },
    { id: 3, name: 'Reactive call', type: 'C' },
    { id: 4, name: 'Call not for companies', type: 'D' },
    { id: 5, name: "FI doesn't work this call", type: 'E' },
  ];

  const statusOptions = [
    { id: 0, name: 'Closed' },
    { id: 1, name: 'Open' },
    { id: 2, name: 'Pending publication' },
  ];

  const minimisOptions = [
    { id: 0, name: 'No' },
    { id: 1, name: 'Yes' },
  ];

  const onOk = () => {
    const countries = userProfile.countries.filter((country) => selectedCountries.includes(country.code));
    const annuities = userProfile.annuities.filter((annuity) => selectedAnnuities.includes(annuity.id));
    const categories = categoryOptions.filter((category) => selectedCategories.includes(category.id));
    const targetSectors = userProfile.targetSectors.filter((sector) => selectedTargetSectors.includes(sector.id));
    const status = statusOptions.filter((status) => selectedStatus.includes(status.id));
    const minimis = minimisOptions.filter((minimis) => selectedMinimis.includes(minimis.id));

    handleChanges({
      ...filters,
      countries,
      annuities,
      category: categories,
      targetSectors,
      status,
      minimis,
    });
    props.onCancel();
  };

  React.useEffect(() => {
    setSelectedCountries(filters.countries.map((country) => country.code));
    setSelectedAnnuities(filters.annuities.map((annuity) => annuity.id));
    setSelectedCategories(filters.category.map((category) => category.id));
    setSelectedTargetSectors(filters.targetSectors.map((sector) => sector.id));
    setSelectedStatus(filters.status.map((status) => status.id));
    setSelectedMinimis(filters.minimis.map((minimis) => minimis.id));
  }, []);

  return (
    <Modal
      title={t('Manage default filters - agile search')}
      open={true}
      onCancel={() => props.onCancel()}
      footer={[
        <Button key="cancel" onClick={() => props.onCancel()}>
          {t('Cancel')}
        </Button>,
        <Button key="save" type="primary" onClick={() => onOk()}>
          {t('Save')}
        </Button>,
      ]}
    >
      <Paragraph>
        {t('Agile search automatically applies criteria to facilitate the search process. You can modify them to meet your needs.')}
      </Paragraph>
      <div
        style={{
          width: '100%',
          padding: 16,
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
          <Text>{t('Country')}</Text>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            value={selectedCountries}
            onChange={(value: string[]) => setSelectedCountries(value)}
            options={userProfile.countries.map((country) => ({
              value: country.code,
              label: t(country.name),
            }))}
          />
        </Space>
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
          <Text>{t('Annuity')}</Text>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            value={selectedAnnuities}
            onChange={(value: string[]) => setSelectedAnnuities(value)}
            options={userProfile.annuities.map((country) => ({
              value: country.id,
              label: country.name,
            }))}
          />
        </Space>
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
          <Text>{t('Category')}</Text>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            value={selectedCategories}
            onChange={(value: string[]) => setSelectedCategories(value)}
            options={categoryOptions.map((category) => ({
              value: category.id,
              label: t(category.name),
            }))}
          />
        </Space>
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
          <Text>{t('Target Sector')}</Text>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            value={selectedTargetSectors}
            onChange={(value: string[]) => setSelectedTargetSectors(value)}
            options={userProfile.targetSectors.map((category) => ({
              value: category.id,
              label: t(category.name),
            }))}
          />
        </Space>
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
          <Text>{t('Status')}</Text>
          <Checkbox.Group
            options={statusOptions.map((status) => ({
              label: t(status.name),
              value: status.id,
            }))}
            value={selectedStatus}
            onChange={(value: any) => setSelectedStatus(value)}
          />
        </Space>
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
          <Text>{t('Minimis')}</Text>
          <Checkbox.Group
            options={minimisOptions.map((status) => ({
              label: t(status.name),
              value: status.id,
            }))}
            value={selectedMinimis}
            onChange={(value: any) => setSelectedMinimis(value)}
          />
        </Space>
      </div>
      <Text type="secondary">
        <span style={{ fontSize: 11, lineHeight: 1 }}>* This setting will be applied by default whenever you use the quick search option.</span>
      </Text>
    </Modal>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(FilterManagement)))));
