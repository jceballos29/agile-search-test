'use client';
import React from 'react';
import styles from './filters.module.css';
import { Button, Col, Row, Select, Space, Tooltip, Typography } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { AppstoreOutlined, QuestionCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { GetCountryImageFlag } from 'src/components/flags-icons';
import { GrantFilters } from 'src/components/grant-filters';

const { Text } = Typography;

interface SelectedFilters {
  countries: string[];
  locations: string[];
  annuities: string[];
  typologies: string[];
  sectors: string[];
  targetSectors: string[];
  bftypes: string[];
  category: string[];
  status: string[];
  minimis: string | undefined;
}

export interface FiltersProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {
  // types...
  onFilterChange: (filter: GrantFilters) => void;
  filter: GrantFilters;
}

export interface CategorySummary {
  id: number;
  name: string;
  type: string;
}

const categories = [
  { id: 1, name: 'Very important call', type: 'A' },
  { id: 2, name: 'Important call', type: 'B' },
  { id: 3, name: 'Reactive call', type: 'C' },
  { id: 4, name: 'Call not for companies', type: 'D' },
  { id: 5, name: "FI doesn't work this call", type: 'E' },
];

export interface StatusSummary {
  id: number;
  name: string;
}

const statuses = [
  { id: 0, name: 'Closed' },
  { id: 1, name: 'Open' },
  { id: 2, name: 'Pending publication' },
];

export interface MinimisSummary {
  id: number;
  name: string;
}

const minimisOptions = [
  { id: 1, name: 'Yes' },
  { id: 0, name: 'No' },
];

const Filters: React.FC<FiltersProps> = (props) => {
  const { t, location, history, userProfile, onFilterChange } = props;

  const params = React.useMemo(() => new URLSearchParams(location.search), [location.search]);

  const setSelectsFromFilter = (filter: GrantFilters) => {
    let selects: SelectedFilters = {
      countries: filter.countries ? filter.countries.map((item) => item.value.toString()) : [],
      locations: filter.locations ? filter.locations.map((item) => item.value.toString()) : [],
      annuities: filter.annuities ? filter.annuities.map((item) => item.value.toString()) : [],
      typologies: filter.typologies ? filter.typologies.map((item) => item.value.toString()) : [],
      sectors: filter.sectors ? filter.sectors.map((item) => item.value.toString()) : [],
      targetSectors: filter.targetSectors ? filter.targetSectors.map((item) => item.value.toString()) : [],
      bftypes: filter.bftypes ? filter.bftypes.map((item) => item.value.toString()) : [],
      category: filter.category ? filter.category.map((item) => item.value.toString()) : [],
      status: filter.status ? filter.status.map((item) => item.value.toString()) : [],
      minimis: filter.minimis ? filter.minimis.toString() : undefined,
    };
    setSelects(selects);
  }


  const [resultView, setResultView] = React.useState<'table' | 'cards'>('cards');
  const [selects, setSelects] = React.useState<SelectedFilters>({
    countries: [],
    locations: [],
    annuities: [],
    typologies: [],
    sectors: [],
    targetSectors: [],
    bftypes: [],
    category: [],
    status: [],
    minimis: undefined,
  });

  const builderFilters = () => {
    let filter: GrantFilters = {};
    const keys = Object.keys(selects);
    keys.forEach((key) => {
      filter[key] = Array.isArray(selects[key]) ? selects[key].map((item) => ({ value: key === 'countries' ? item : parseInt(item) })) : selects[key];
    });
    return filter;
  };


  React.useEffect(() => {
    const view = params.get('view');
    if (view) {
      setResultView(view as 'table' | 'cards');
    } else {
      params.set('view', 'cards');
      history.push({
        search: params.toString(),
      });
      setResultView('cards');
    }
  }, [history, params]);

  return (
    <aside className={styles.filters}>
      <div className={styles.filters_content}>
        <Space className={styles.filters_actions} direction="horizontal">
          <Space direction="horizontal" size="small">
            <Button
              type="primary"
              onClick={() => {
                onFilterChange(builderFilters());
              }}
            >
              {t('Apply Filters')}
            </Button>
            <Button
              type="link"
              style={{ color: '#0000a4' }}
              onClick={() => {
                setSelects({
                  countries: [],
                  locations: [],
                  annuities: [],
                  typologies: [],
                  sectors: [],
                  targetSectors: [],
                  bftypes: [],
                  category: [],
                  status: [],
                  minimis: undefined,
                });
              }}
            >
              {t('Clear')}
            </Button>
          </Space>
          <Space direction="horizontal" size="small">
            <Button
              icon={
                <UnorderedListOutlined
                  style={{
                    color: resultView === 'table' ? '#0000a4' : '#00000040',
                  }}
                />
              }
              style={{
                borderColor: resultView === 'table' ? '#0000a4' : '#00000040',
              }}
              onClick={() => {
                params.set('view', 'table');
                history.push({
                  search: params.toString(),
                });
                setResultView('table');
              }}
            />
            <Button
              icon={
                <AppstoreOutlined
                  style={{
                    color: resultView === 'cards' ? '#0000a4' : '#00000040',
                  }}
                />
              }
              style={{
                borderColor: resultView === 'cards' ? '#0000a4' : '#00000040',
              }}
              onClick={() => {
                params.set('view', 'cards');
                history.push({
                  search: params.toString(),
                });
                setResultView('cards');
              }}
            />
          </Space>
        </Space>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Country')}</Text>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Country')}
              value={selects.countries}
              optionLabelProp="label"
              onChange={(value: string[]) => {
                setSelects({ ...selects, countries: value, locations: [] });
              }}
            >
              {userProfile.countries
                .sort((a, b) => t(a.name).localeCompare(t(b.name)))
                .map((country) => (
                  <Select.Option key={country.code} value={country.code} label={t(country.name)}>
                    <Row>
                      <Col span={21}>
                        <Space direction="horizontal" size="middle">
                          <figure className={styles.flag}>{GetCountryImageFlag(country.code, userProfile.countries)}</figure>
                          {t(country.name)}
                        </Space>
                      </Col>
                      <Col span={3}>
                        <Text strong>{country.code}</Text>
                      </Col>
                    </Row>
                  </Select.Option>
                ))}
            </Select>
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Region')}</Text>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Region')}
              value={selects.locations}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, locations: value })}
            >
              {selects.countries.length === 0
                ? userProfile.locations.map((location) => (
                    <Select.Option key={location.id} value={location.id} label={t(location.name)}>
                      <Row>
                        <Col span={21}>
                          <Space direction="horizontal" size="middle">
                            <figure className={styles.flag}>{GetCountryImageFlag(location.countryCode, userProfile.countries)}</figure>
                            {t(location.name)}
                          </Space>
                        </Col>
                        <Col span={3}>
                          <Text strong>{location.countryCode}</Text>
                        </Col>
                      </Row>
                    </Select.Option>
                  ))
                : userProfile.locations
                    .filter((location) => selects.countries.includes(location.countryCode))
                    .map((location) => (
                      <Select.Option key={location.id} value={location.id} label={t(location.name)}>
                        <Row>
                          <Col span={21}>
                            <Space direction="horizontal" size="middle">
                              <figure className={styles.flag}>{GetCountryImageFlag(location.countryCode, userProfile.countries)}</figure>
                              {t(location.name)}
                            </Space>
                          </Col>
                          <Col span={3}>
                            <Text strong>{location.countryCode}</Text>
                          </Col>
                        </Row>
                      </Select.Option>
                    ))}
            </Select>
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Annuity')}</Text>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Annuity')}
              value={selects.annuities}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, annuities: value })}
              options={userProfile.annuities.map((annuity) => ({
                label: t(annuity.name),
                value: annuity.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div className={styles.label_with_help} style={{ width: '100%' }}>
              <Text>{t('Typology')}</Text>
              <Tooltip title={t('Type of project or action to be subsidised by the call proposals')}>
                <QuestionCircleOutlined style={{ fontSize: 14, color: '#00000073' }} />
              </Tooltip>
            </div>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Annuity')}
              value={selects.typologies}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, typologies: value })}
              options={userProfile.typologies.map((typology) => ({
                label: t(typology.name),
                value: typology.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div className={styles.label_with_help} style={{ width: '100%' }}>
              <Text>{t('Sector')}</Text>
              <Tooltip title={t('Business sectors that may be applicant to the funding call, gathered in the regulation as possible beneficiary')}>
                <QuestionCircleOutlined style={{ fontSize: 14, color: '#00000073' }} />
              </Tooltip>
            </div>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Annuity')}
              value={selects.sectors}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, sectors: value })}
              options={userProfile.sectors.map((sector) => ({
                label: t(sector.name),
                value: sector.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div className={styles.label_with_help} style={{ width: '100%' }}>
              <Text>{t('Target Sector')}</Text>
              <Tooltip
                title={t(
                  'Specific sectors of those gathered in the regulation as possible beneficiary that will have greater financing possibilities, since they are fully aligned with the call objectives and kind of projects to be granted'
                )}
              >
                <QuestionCircleOutlined style={{ fontSize: 14, color: '#00000073' }} />
              </Tooltip>
            </div>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Annuity')}
              value={selects.targetSectors}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, targetSectors: value })}
              options={userProfile.targetSectors.map((target) => ({
                label: t(target.name),
                value: target.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Beneficiary Type')}</Text>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Annuity')}
              value={selects.bftypes}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, bftypes: value })}
              options={userProfile.beneficiaryTypes.map((type) => ({
                label: t(type.name),
                value: type.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Category')}</Text>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Annuity')}
              value={selects.category}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, category: value })}
              options={categories.map((type) => ({
                label: t(type.name),
                value: type.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Status')}</Text>
            <Select
              mode="multiple"
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Status')}
              value={selects.status}
              optionLabelProp="label"
              onChange={(value: string[]) => setSelects({ ...selects, status: value })}
              options={statuses.map((type) => ({
                label: t(type.name),
                value: type.id,
              }))}
            />
          </Space>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text>{t('Minimis')}</Text>
            <Select
              allowClear
              showArrow
              menuItemSelectedIcon={<></>}
              style={{ width: '100%' }}
              placeholder={t('Select Minimis')}
              value={selects.minimis}
              optionLabelProp="label"
              onChange={(value: string) => setSelects({ ...selects, minimis: value })}
              options={minimisOptions.map((type) => ({
                label: t(type.name),
                value: type.id,
              }))}
            />
          </Space>
        </Space>
      </div>
    </aside>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(Filters)))));
