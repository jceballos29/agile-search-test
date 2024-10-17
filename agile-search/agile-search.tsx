import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import {
  StarOutlined,
  StarFilled,
  MoreOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  VerticalAlignBottomOutlined,
  EyeOutlined,
  CaretLeftOutlined,
  InfoCircleFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import './styles.less';
import ContentHeader from 'src/core/ui/content-header';
import { Alert, Badge, Button, Dropdown, Pagination, Space, Steps, Table, Tag, Tooltip, Typography, Row, Col } from 'antd';
import FilterManagement from './components/filter-management';
import FileSaver from 'file-saver';
import { response } from './data';
import { RouteComponentProps, useHistory, useLocation, withRouter, Link } from 'react-router-dom';
import { container } from 'src/inversify.config';
import HttpService from 'src/core/services/http.service';
import ResultCard from './components/result-card';

const { Title } = Typography;

export type FiltersOptions = 'countries' | 'sectors' | 'typologies' | 'locations' | 'annuities' | 'category' | 'targetSectors' | 'status' | 'minimis';

export interface Filters {
  countries: any[];
  sectors: any[];
  typologies: any[];
  locations: any[];
  annuities: any[];
  category: any[];
  targetSectors: any[];
  status: any[];
  minimis: any[];
}

export interface SearchStep {
  step: number;
  type: FiltersOptions;
  title: string;
  description: string;
  tags: any[];
  next: FiltersOptions | null;
  previous: FiltersOptions | null;
}

export interface AgileSearchProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {}

const nationals = ['National', 'Nationale', 'Nazionale', 'Nacional'];
const defaultCountry = 'Es'; // tomarlo de params

const AgileSearch: React.FC<AgileSearchProps> = (props) => {
  const { t, userProfile } = props;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const history = useHistory();
  const httpService = container.get(HttpService);

  const [activeStep, setActiveStep] = React.useState<SearchStep>({
    step: 0,
    type: 'sectors',
    title: t('Select a sector'),
    description: t('Click on the tags to select a sector'),
    tags: userProfile.sectors.sort((a, b) => a.name.localeCompare(b.name)),
    next: 'typologies',
    previous: null,
  });
  const [locations, setLocations] = React.useState([]);
  const [openParamsModal, setOpenParamsModal] = React.useState(false);
  const [tags, setTags] = React.useState<any[]>([]);
  const [resultsView, setResultsView] = React.useState<'cards' | 'table'>('table');

  const [filters, setFilters] = React.useState<Filters>({
    countries: [],
    sectors: [],
    typologies: [],
    locations: [],
    annuities: [],
    category: [],
    targetSectors: [],
    status: [],
    minimis: [],
  });

  // const handleNavigation = (activeKey: string) => {
  //   history.push(activeKey);
  // };

  const steps = [
    {
      step: 0,
      type: 'sectors',
      title: t('Select a sector'),
      description: t('Click on the tags to select a sector'),
      next: 'typologies',
      previous: null,
    },
    {
      step: 1,
      type: 'typologies',
      title: t('Select a typology'),
      description: t('Click on the tags to select a typology'),
      next: 'locations',
      previous: 'sectors',
    },
    {
      step: 2,
      type: 'locations',
      title: t('Select a region'),
      description: t('Click here to add a region to the national call for applications.'),
      next: 'results',
      previous: 'typologies',
    },
    {
      step: 3,
      type: 'results',
      title: t('Results'),
      description: t('Click here to see the results of the search'),
      next: null,
      previous: 'locations',
    },
  ];

  const handleChangeFilters = (type: FiltersOptions, value: any) => {
    const filter = filters[type];
    const filterIndex = filter.findIndex((f) => {
      if (type === 'countries') {
        return f.code === value.code;
      }
      return f.id === value.id;
    });
    if (filterIndex === -1) {
      setFilters({
        ...filters,
        [type]: [...filter, value],
      });
    } else {
      setFilters({
        ...filters,
        [type]: filter.filter((f) => f.id !== value.id),
      });
    }
  };

  const handleLocalStorage = (actions: 'save' | 'load' | 'remove', data?: Filters) => {
    console.log({ actions, data });
    if (actions === 'remove') {
      localStorage.removeItem('agileSearchFilters');
      return;
    }

    if (actions === 'save' && !data) {
      return;
    }

    if (actions === 'save' && data) {
      localStorage.setItem('agileSearchFilters', JSON.stringify(data));
      return;
    }

    if (actions === 'load' && !localStorage.getItem('agileSearchFilters')) {
      return {
        countries: [],
        sectors: [],
        typologies: [],
        locations: [],
        annuities: [],
        category: [],
        targetSectors: [],
        status: [],
        minimis: [],
      };
    }

    const result = localStorage.getItem('agileSearchFilters');
    console.log({ result });
    if (result) {
      return JSON.parse(result);
    }
  };

  const columns: any[] = [
    {
      title: '',
      dataIndex: 'isFavorite',
      key: 'isFavorite',
      width: 48,
      align: 'center',
      render: (isFavorite: boolean) => (
        <Space>
          <Tooltip title={isFavorite ? t('Remove from favorites') : t('Add to favorites')}>
            <Button type="text" icon={isFavorite ? <StarFilled /> : <StarOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('Title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <Link to={`/search/${record.id}`} style={{ color: '#0000A4' }}>
          {title}
        </Link>
      ),
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status: string) => <Badge status={status === 'Open' ? 'success' : status === 'Closed' ? 'processing' : 'default'} text={status} />,
    },
    {
      title: t('Closing'),
      key: 'closingDate',
      align: 'center',
      width: 120,
      render: (_: string, record: any) => {
        if (record.periods && record.periods.length > 0) {
          return (
            <Tag color="volcano" style={{ margin: 0 }}>
              {record.periods[record.periods.length - 1].closingDate.split('T')[0]}
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
      render: (_: string, record: any) => (
        <Space wrap>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  label: t('See details'),
                  key: 'details',
                  icon: <EyeOutlined style={{ color: '#0000a4' }} />,
                  onClick: () => history.push(`/search/${record.id}`),
                },
                {
                  label: t('Download ID Card'),
                  key: 'download',
                  icon: <VerticalAlignBottomOutlined style={{ color: '#0000a4' }} />,
                  onClick: async () => {
                    const result = await httpService.get(`api/v1/grants/grantSlide/${record.id}`, {
                      responseType: 'arraybuffer',
                    });
                    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
                    (FileSaver as any).saveAs(blob, `${record.title}.pptx`);
                  },
                },
              ] as any,
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  React.useEffect(() => {
    const stepParam = queryParams.get('step');
    const defaultStep = steps.find((s) => s.type === stepParam) || steps[0];
    queryParams.set('step', defaultStep.type);
    history.push({ search: queryParams.toString() });
    setActiveStep(defaultStep as SearchStep);

    const country = userProfile.countries.find((country) => country.code === defaultCountry);
    const regions = userProfile.locations.filter((location) => location.countryCode === country.code);
    const national = regions.find((region) => nationals.includes(region.name));

    const savedFilters = handleLocalStorage('load');
    console.log({ savedFilters });
    setFilters({
      ...savedFilters,
      countries: savedFilters.countries.find((c) => c.code === country.code) ? filters.countries : [...savedFilters.countries, country],
      locations: savedFilters.locations.find((l) => l.id === national.id) ? filters.locations : [...savedFilters.locations, national],
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const regions = [];
    filters.countries.forEach((country) => regions.push(...userProfile.locations.filter((location) => location.countryCode === country.code)));
    setLocations(regions);
  }, [filters.countries, userProfile.locations]);

  React.useEffect(() => {
    switch (activeStep.type) {
      case 'sectors':
        setTags(userProfile.sectors.sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case 'typologies':
        setTags(userProfile.typologies.sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case 'locations':
        setTags(locations.sort((a, b) => a.name.localeCompare(b.name)));
        break;
      default:
        setTags([]);
        break;
    }
  }, [activeStep, locations, userProfile]);

  return (
    <>
      {openParamsModal && <FilterManagement onCancel={() => setOpenParamsModal(false)} filters={filters} handleChanges={setFilters} />}
      <div className="agile-search">
        <div className="container">
          <nav>
            <ContentHeader hideBreadcrumb title={t('Grants Searcher')} />
          </nav>
          <div className="content">
            <div className="header">
              <div className="navigation">
                <Button onClick={() => history.push('/')} className="back-button" icon={<CaretLeftOutlined />} type="text">
                  {t('Back to normal search')}
                </Button>
                <Title className="central-title" level={3}>
                  {activeStep.step === 3 ? (
                    <>
                      <span style={{ marginRight: 10 }}>
                        Mostrando {response.items.length} de {response.count} resultados
                      </span>
                      <Tooltip title={t('Distinctively monetize cost effective networks for cross-media bandwidth')}>
                        <ExclamationCircleOutlined style={{ fontSize: 18 }} />
                      </Tooltip>
                    </>
                  ) : (
                    activeStep.title
                  )}
                </Title>
              </div>
              {activeStep.step !== 3 && (
                <div className="search-steps">
                  <Steps
                    progressDot
                    current={activeStep.step}
                    items={[
                      {
                        title: t('Sector'),
                      },
                      {
                        title: t('Typology'),
                      },
                      {
                        title: t('Region'),
                      },
                    ]}
                  />
                </div>
              )}
            </div>
            <div
              className="results"
              style={{
                paddingLeft: activeStep.step === 3 ? 16 : 332,
              }}
            >
              <div
                className="filters"
                style={{
                  width: activeStep.step === 3 ? 0 : 316,
                  visibility: activeStep.step === 3 ? 'hidden' : 'visible',
                  opacity: activeStep.step === 3 ? 0 : 1,
                }}
              >
                <div className="description">
                  <Alert message={activeStep.description} type="info" />
                </div>
                <div className="tags">
                  {tags.map((tag) => (
                    <Tag
                      key={tag.id}
                      color={filters[activeStep.type as FiltersOptions].find((f) => f.id === tag.id) ? 'blue' : 'default'}
                      onClick={() => handleChangeFilters(activeStep.type as FiltersOptions, tag)}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag.name}
                    </Tag>
                  ))}
                </div>
                <div className="actions">
                  <Button
                    block
                    disabled={activeStep.previous === null}
                    onClick={() => {
                      queryParams.set('step', activeStep.previous);
                      history.push({ search: queryParams.toString() });
                      setActiveStep((steps.find((s) => s.type === activeStep.previous) as SearchStep) || activeStep);
                    }}
                  >
                    {t('Back')}
                  </Button>
                  <Button
                    block
                    disabled={activeStep.next === null}
                    onClick={() => {
                      queryParams.set('step', activeStep.next);
                      history.push({ search: queryParams.toString() });
                      setActiveStep((steps.find((s) => s.type === activeStep.next) as SearchStep) || activeStep);
                    }}
                    type="primary"
                  >
                    {t('Continue')}
                  </Button>
                </div>
              </div>
              <div className="results-list">
                <div className="filters-helps">
                  <InfoCircleFilled style={{ color: '#0000A4', fontSize: 18 }} />
                  <span>La búsqueda ágil selecciona por defecto algunos parámetros.</span>
                  <Button className="modal-button" type="link" onClick={() => setOpenParamsModal(true)}>
                    Saber más
                  </Button>
                </div>
                <div className="pagination">
                  <div className="totals">
                    {activeStep.step === 3 ? (
                      <>
                        <Button
                          onClick={() => {
                            queryParams.set('step', 'locations');
                            history.push({ search: queryParams.toString() });
                            setActiveStep(steps.find((s) => s.type === 'locations') as SearchStep);
                            setResultsView('table');
                          }}
                          icon={<CaretLeftOutlined />}
                        >
                          {t('Volver a la selección de comunidad autónoma')}
                        </Button>
                        <Button
                          type={resultsView === 'table' ? 'primary' : 'default'}
                          icon={<UnorderedListOutlined />}
                          onClick={() => setResultsView('table')}
                        />
                        <Button
                          type={resultsView === 'cards' ? 'primary' : 'default'}
                          icon={<AppstoreOutlined />}
                          onClick={() => setResultsView('cards')}
                        />
                      </>
                    ) : (
                      <>
                        <span>
                          Mostrando {response.items.length} de {response.count} resultados
                        </span>
                        <Tooltip title={t('Distinctively monetize cost effective networks for cross-media bandwidth')}>
                          <ExclamationCircleOutlined style={{ fontSize: 18 }} />
                        </Tooltip>
                      </>
                    )}
                  </div>
                  <Pagination showSizeChanger showQuickJumper defaultCurrent={1} total={response.count} pageSizeOptions={['20', '50', '100']} />
                </div>
                {/* <div>
                  <div>
                    <strong>Countries: </strong>
                    <span>{filters.countries.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Sectors: </strong>
                    <span>{filters.sectors.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Typologies: </strong>
                    <span>{filters.typologies.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Regions: </strong>
                    <span>{filters.locations.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Annuities: </strong>
                    <span>{filters.annuities.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Categories: </strong>
                    <span>{filters.category.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Target Sectors: </strong>
                    <span>{filters.targetSectors.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Status: </strong>
                    <span>{filters.status.map((c) => c.name).join(', ')}</span>
                  </div>
                  <div>
                    <strong>Minimis: </strong>
                    <span>{filters.minimis.map((c) => c.name).join(', ')}</span>
                  </div>
                </div> */}
                <div className="grants">
                  {resultsView === 'cards' ? (
                    <Row gutter={[8, 8]} style={{ width: '100%' }}>
                      {response.items.map((item: any) => (
                        <Col span={24}>
                          <ResultCard key={item.id} grant={item} />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Table rowKey={(record: any) => record.id} columns={columns} dataSource={response.items} pagination={false} size="middle" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(AgileSearch)))));
