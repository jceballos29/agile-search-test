import * as React from 'react';
import { AuditOutlined, NotificationOutlined, SettingOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import { NavItem } from 'src/core/ui/shell-header';
import { Avatar, Menu } from 'antd';
import MenuItem from 'antd/lib/menu/MenuItem';

export function getSideMenu(t: (value: string) => string, screenWidth: number): React.ReactNode[] {
  return [];
}

export function getTopMainMenu(t: (value: string) => string, screenWidth: number): React.ReactNode[] {
  return [];
}

export function getTopRightMenu(roles: string[], isRealAdmin: boolean, onMenuClick :any) {
  let isAdmin = roles.filter((o) => o.includes('Administrator')).length > 0;
  const onlyCountryViewer = (roles ? roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

  return (t: (value: string) => string, screenWidth: number): React.ReactNode[] => {
    // const isTabletAndMobile = screenWidth < 768;

    var menu = [];
    menu.push(
      <NavItem
        key="/subscriptions"
        to="/subscriptions"
        icon={
          <Avatar
            style={{ color: '#0000A9', backgroundColor: 'white' }}
            icon={<NotificationOutlined style={{ fontSize: '30px' }} />}
            size="small"
            shape="square"
          />
        }
        title={t('Subscriptions')}
      />
    );
    if ((isAdmin || isRealAdmin) && !onlyCountryViewer) {
      menu.push(
        <NavItem
          key="/admin"
          to="/admin"
          icon={
            <Avatar
              style={{ color: '#0000A9', backgroundColor: 'white' }}
              icon={<SettingOutlined style={{ fontSize: '30px' }} />}
              size="small"
              shape="square"
            />
          }
          title={t('Settings')}
        />
      );
      }
      menu.push(
          <div
              onClick={(p) => onMenuClick('whatsnew')}
              style={{ lineHeight: "56px" }}              
          >
              <NavItem                 
                  key="whatsnew"
                  icon={
                      <Avatar
                          style={{ color: '#0000A9', backgroundColor: 'white' }}
                          icon={< QuestionCircleOutlined style={{ fontSize: '30px' }} />}
                          size="small"
                          shape="square"
                      />
                  }
                  title={t('Releases')}
              />
          </div>         
      );
    return menu;
  };
}
