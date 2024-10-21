import { CalendarOutlined, HeartOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom';
import NotificationsFeaturedMessages from 'src/components/notifications-featured-messages/notifications-featured-messages';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import ContentHeader from 'src/core/ui/content-header';

export interface NavigationProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {}

const Navigation: React.FC<NavigationProps> = (props) => {
  const { t, identity, userProfile } = props;

  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0;
  const onlyCountryViewer = (identity.roles ? identity.roles : []).some((r) => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

  const history = useHistory();

  const navigation = [
    {
      key: 'searcher',
      to: '/',
      name: 'Searcher',
      icon: <SearchOutlined style={{ color: '#0000a4' }} />,
    },
    {
      key: 'calendar',
      to: '/calendar',
      name: 'Calendar',
      icon: <CalendarOutlined style={{ color: '#0000a4' }} />,
    },
    {
      key: 'favorites',
      to: '/favorites',
      name: 'Favorites',
      icon: <HeartOutlined style={{ color: '#0000a4' }} />,
    },
    {
      key: 'history',
      to: '/history',
      name: 'History',
      icon: <HistoryOutlined style={{ color: '#0000a4' }} />,
    },
  ];

  return (
    <nav>
      <ContentHeader hideBreadcrumb title={t('Grants Searcher')} />
      <Space>
        {navigation.map((item) => (
          <Button key={item.key} className="fi-light-blue-button-new" onClick={() => history.push(item.to)} icon={item.icon}>
            {t(item.name)}
          </Button>
        ))}
        {!onlyCountryViewer && userProfile.isFullAdmin && <NotificationsFeaturedMessages />}
      </Space>
    </nav>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(Navigation)))));
