'use client';
import React from 'react';
import styles from './navigation.module.css';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter, NavLink, useHistory } from 'react-router-dom';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { CalendarOutlined, HeartOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import ContentHeader from 'src/core/ui/content-header';
import { Button, Space } from 'antd';
import NotificationsFeaturedMessages from 'src/components/notifications-featured-messages/notifications-featured-messages';

export interface NavigationProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {
  // types...
}

const Navigation: React.FC<NavigationProps> = (props) => {
  const { t, identity, userProfile } = props;
  const history = useHistory();

  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0;
  const onlyCountryViewer = (identity.roles ? identity.roles : []).some((r) => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

  const navigation = [
    {
      key: 'searcher',
      to: '/',
      name: 'Searcher',
      icon: <SearchOutlined />,
      isActive: true,
    },
    {
      key: 'calendar',
      to: '/calendar',
      name: 'Calendar',
      icon: <CalendarOutlined style={{ color: '#0000a4' }} />,
      isActive: false,
    },
    {
      key: 'favorites',
      to: '/favorites',
      name: 'Favorites',
      icon: <HeartOutlined style={{ color: '#0000a4' }} />,
      isActive: false,
    },
    {
      key: 'history',
      to: '/history',
      name: 'History',
      icon: <HistoryOutlined style={{ color: '#0000a4' }} />,
      isActive: false,
    },
  ];

  return (
    <div className={styles.navigation}>
      <ContentHeader hideBreadcrumb title={t('Grants Searcher')} />
      <Space direction="horizontal">
        {navigation.map(({ icon, key, name, to, isActive }) => (
          <Button
            onClick={() => history.push(to)}
            key={key}
            type={isActive ? 'primary' : 'default'}
            icon={icon}
            className={ isActive ? styles.active : styles.button }
            
          >
            {t(name)}
          </Button>
        ))}
        {!onlyCountryViewer && userProfile.isFullAdmin && <NotificationsFeaturedMessages />}
      </Space>
    </div>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(Navigation)))));
