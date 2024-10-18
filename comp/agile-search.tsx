import {
  AppstoreOutlined,
  CaretLeftOutlined,
  ExclamationCircleOutlined,
  InfoCircleFilled,
  UnorderedListOutlined
} from '@ant-design/icons';
import { Button, Pagination, Steps, Tooltip } from 'antd';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import FilterManagement from './components/filter-management';
import FiltersAside from './components/filters-aside';
import Header from './components/header';
import Navigation from './components/navigation';
import ResultsCards from './components/results-cards';
import ResultsTable from './components/results-table';
import { defaultCountry, nationals } from './constants';
import { useStep } from './context/steps';
import { response } from './data';
import useFilters from './hooks/useFilters';
import './styles.less';

export interface AgileSearchProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {}

const AgileSearch: React.FC<AgileSearchProps> = (props) => {
  const { t, userProfile } = props;

  const { activeStep, handleSetStep } = useStep();
  const { filters, updateFilters } = useFilters();

  const [openParamsModal, setOpenParamsModal] = React.useState(false);
  const [resultsView, setResultsView] = React.useState<'cards' | 'table'>('table');

  React.useEffect(() => {

    const country = userProfile.countries.find((country) => country.code === defaultCountry);
    const regions = userProfile.locations.filter((location) => location.countryCode === country.code);
    const national = regions.find((region) => nationals.includes(region.name));

    updateFilters({
      countries: filters.countries.find((c) => c.code === country.code) ? filters.countries : [...filters.countries, country],
      locations: filters.locations.find((l) => l.id === national.id) ? filters.locations : [...filters.locations, national],
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {openParamsModal && <FilterManagement onCancel={() => setOpenParamsModal(false)} />}
      <div className="agile-search">
        <div className="container">
          <Navigation />
          <div className="content">
            <div className="header">
              <Header />
              {activeStep.step !== 3 && (
                <div className="search-steps">
                  <Steps
                    progressDot
                    current={activeStep.step}
                    items={[
                      {
                        title: t('Sector'),
                        onClick: () => handleSetStep('sectors'),
                      },
                      {
                        title: t('Typology'),
                        onClick: () => handleSetStep('typologies'),
                      },
                      {
                        title: t('Region'),
                        onClick: () => handleSetStep('locations'),
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
              <FiltersAside />
              <div className="results-list">
                <div className="filters-helps">
                  <InfoCircleFilled style={{ color: '#0000A4', fontSize: 18 }} />
                  <span>{t("Agile search selects some parameters by default.")}</span>
                  <Button className="modal-button" type="link" onClick={() => setOpenParamsModal(true)}>
                    {t("Learn more")}
                  </Button>
                </div>
                <div className="pagination">
                  <div className="totals">
                    {activeStep.step === 3 ? (
                      <>
                        <Button
                          onClick={() => {
                            handleSetStep('locations');
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
                <div className="grants">{resultsView === 'cards' ? <ResultsCards /> : <ResultsTable />}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(AgileSearch)))));
