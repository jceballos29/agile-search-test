import { Col, Row, Button, Radio, Spin, Tabs, Card, Input, Alert } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { container } from 'src/inversify.config';
import { Query } from 'src/core/stores/data-store';
import { ConfigSettingSummary, ConfigSettingSummaryDataStore } from 'src/stores/config-setting-store';
import HttpService, { formatMessage } from '../../../core/services/http.service';
import { CacheProps, withCache } from '../../../core/services/cache.service';
import WhatsNewEdit from './whatsNewEdit'
import { WhatsNew, WhatsNewStore, WhatsNewSummary } from '../../../stores/WhatsNew-store';

interface ConfigSettingHomeProps extends WithTranslation, RouteComponentProps, CacheProps { }

const WhatsNewTab: FC<ConfigSettingHomeProps> = (props) => {
  const { t } = props;
  const whatsNewStore = container.get(WhatsNewStore);
  const whatsNewState = whatsNewStore.state;

  useEffect(() => {
    Load();
  }, []);

  const [query, setQuery] = useState({
    searchQuery: '',
    orderBy: [{ field: 'key', direction: 'Ascending', useProfile: false }],
    skip: 0,
    take: 10,
  } as Query);

  const currentStore = container.get(ConfigSettingSummaryDataStore);


  const Load = (currentQuery: Query = query) => {
    currentStore.load(currentQuery);
  };

  return (
    <Card title={t('Releases')}>
      <Alert message={t('This section can only be modified by the Product Owner of the application')} type="info" showIcon closable />
      <div style={{ width: '100%', margin: '0 5px', overflow: 'hidden' }}>
        <Tabs tabPosition={"left"}>
          <Tabs.TabPane key="en" tab={t("English")}>
            <WhatsNewEdit language={"en"} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Card>
  );
};

export default withCache(withTranslation()(withRouter(WhatsNewTab)));
