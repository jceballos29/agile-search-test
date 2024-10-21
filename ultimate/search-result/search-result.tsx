'use client';
import React from 'react';
import styles from './search-result.module.css';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { Filters, Navigation } from './components';
import { Alert, Button, Input, Pagination, Tooltip } from 'antd';
import { GrantFilters } from 'src/components/grant-filters';
import { QuestionCircleOutlined } from '@ant-design/icons';
// import { useSearch } from './hooks/use-search';

const { Search } = Input;

export interface SearchResultProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {
  // types...
}

const SearchResult: React.FC<SearchResultProps> = (props) => {
  const { t, history, cache } = props;

  const [filter, setFilter] = React.useState<GrantFilters>({});
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [search, setSearch] = React.useState<string>('');

  // const { data, error, loading } = useSearch(
  //   '/grants',
  //   filter,
  //   page,
  //   pageSize,
  //   search
  // )

  const onFilterChange = (filter: GrantFilters) => {
    setFilter(filter);
  };

  const onChangePage = (pageNumber: number, pageSize: number) => {
    setPage(pageNumber);
    setPageSize(pageSize);
  };

  React.useEffect(() => {
    console.log('SearchResult mounted');
    setFilter(cache.getWithCustomKey('search-filter') ?? {});
    setPage(cache.getWithCustomKey('search-page') ?? 1);
    setPageSize(cache.getWithCustomKey('search-page-size') ?? 10);
    setSearch(cache.getWithCustomKey('search-search') ?? '');
  }, [cache]);

  return (
    <div className={styles.search_result}>
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.body}>
            <Filters onFilterChange={onFilterChange} />
            <div className={styles.results}>
              <Alert
                showIcon={true}
                type="info"
                message={t('New Agile Search')}
                description={t('Map out general opportunities to present to your clients!')}
                action={
                  <Button type="primary" onClick={() => history.push('/agile-search')}>
                    {t('Try Agile Search')}
                  </Button>
                }
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
              <div className={styles.results_pagination}>
                <Search
                  allowClear
                  placeholder={t('Search criteria...')}
                  onSearch={(value) => setSearch(value)}
                  value={search}
                  style={{ width: 300 }}
                  suffix={
                    <Tooltip
                      title={t(
                        'The search is performed by an exact term. If the desired result is not found, it is possible that the searching criteria is incorrect, so we recommend to try another description'
                      )}
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  }
                />
                <Pagination
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total: number, range: [number, number]) => `${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total}`}
                  onChange={(pageNumber, pageSize) => onChangePage(pageNumber, pageSize)}
                  current={page}
                  pageSize={pageSize}
                  // total={currentState.count.get()}
                  pageSizeOptions={['20', '50', '100']}
                />
              </div>
              <div className={styles.grants}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(SearchResult)))));
