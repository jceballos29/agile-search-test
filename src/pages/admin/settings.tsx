import Icon, {
  CalendarOutlined,
  CaretRightOutlined,
  ClearOutlined,
  CloudDownloadOutlined,
  EnvironmentOutlined,
  LockOutlined,
  NotificationOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import ContentHeader from 'src/core/ui/content-header';

import FormItem from 'antd/lib/form/FormItem';
import { container } from 'src/inversify.config';
import { Query } from 'src/core/stores/data-store';
import { ConfigSettingSummary, ConfigSettingSummaryDataStore } from 'src/stores/config-setting-store';
import debounce from 'lodash/debounce';
import HttpService, { formatMessage } from '../../core/services/http.service';
import { CacheProps, withCache } from '../../core/services/cache.service';
import { GetFlag, GetImageFlag } from '../../components/flags-icons';
import { useHistory } from 'react-router-dom';
import { TableView } from '../../core/ui/collections/table';
import { formatDate } from '../../core/utils/object';
import Store from '../../core/stores/store';
import SectorSelect from 'src/components/sector-select';
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select';
import CountrySelect from 'src/components/country-select';
const { Search } = Input;
const { Option } = Select;

interface ConfigSettingHomeProps extends WithTranslation, RouteComponentProps, CacheProps {}

const ConfigSettingHome: FC<ConfigSettingHomeProps> = (props) => {
  const { t, cache } = props;

  useEffect(() => {
    Load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [query, setQuery] = useState({
    searchQuery: '',
    orderBy: [{ field: 'key', direction: 'Ascending', useProfile: false }],
    skip: 0,
    take: 10,
  } as Query);

  const httpService = container.get(HttpService);
  const currentStore = container.get(ConfigSettingSummaryDataStore);
  const currentState = currentStore.state;

  const Load = (currentQuery: Query = query) => {
    currentStore.load(currentQuery);
  };

  const configTableModel = {
    query: query,
    columns: [
      {
        sortable: true,
        searcheable: true,
        field: 'key',
        title: t('Key'),
            renderer: (data: ConfigSettingSummary) => <span>{t(data.key)}</span>,
        },
      {
        sortable: false,
        field: 'value',
        title: t('Value'),
        renderer: (data: ConfigSettingSummary) => <span>{data.value}</span>,
        editor: (data: ConfigSettingSummary) => <Input />,
      },
    ],
    data: currentState.value,
    sortFields: [],
  };

  const handleSave = async (item: any, itemState: any) => {
    const result = await currentStore.update(item.key, { key: item.key, value: item.value });
    await currentStore.load(query);
    return result;
  };

  return (
    <Card title={t('Settings')}>
      <div style={{ width: '100%', margin: '0 5px', overflow: 'hidden' }}>
        <TableView
          canEdit
          rowKey="key"
          hideSelection
          onSaveRow={handleSave}
          onQueryChanged={(query: Query) => {
            setQuery(query);
            Load(query);
          }}
          onRefresh={() => Load()}
          model={configTableModel}
          error={currentState.errorMessage.value && formatMessage(currentState.errorMessage.value)}
        />
      </div>
    </Card>
  );
};

export default withCache(withTranslation()(withRouter(ConfigSettingHome)));
