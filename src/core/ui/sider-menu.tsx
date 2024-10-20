import { CheckOutlined, FieldTimeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, NotificationOutlined, ReloadOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { Alert, Badge, Button, Modal, Row, Col, Menu } from 'antd'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import logo from '../assets/fi-group.png'
import { RouteComponentProps, RouteProps, useHistory, useLocation, withRouter } from 'react-router'
import HttpService from '../services/http.service'
import { container } from '../../inversify.config'
import { QueryResult } from '../stores/data-store'
import Sider from 'antd/lib/layout/Sider'
import Layout from 'antd/lib/layout/layout'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import Tooltip from 'antd/es/tooltip'


export interface SiderMenuProps {
  key: string
  icon: React.ReactNode,
  label: string,
  requiredRoles?: string[]
  target?: string
  exact?: boolean
  useBaseUrl?: boolean
  children?: SiderMenuProps[]
}

interface Props extends WithTranslation, IdentityProps, RouteComponentProps {
  width?: string
  collapseWidth?: string
  menu: SiderMenuProps[],
  collapsible?: boolean,
  collapseDefaultValue?: boolean
  onCollapseChange?: (collapse) => void
  baseUrl?: string
}

const SiderMenu: FC<Props> = (props) => {
  const { t } = props
  const [busy, setBusy] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [menu, setMenu] = useState<SiderMenuProps[]>(props.menu);
  const httpService = useMemo(() => container.get(HttpService), [])
  const location = useLocation();

  useEffect(() => {
    var keys = setKeys(location.pathname)
    setSelectedKeys(keys)
  }, [location])

  useEffect(() => {
    setMenu(props.menu);
  }, [props.menu])

  const setKeys = (url) => {

    var keys = []
    menu.map(item => {
      if (item.exact) {
        if (url == (item.useBaseUrl ? props.baseUrl : "") + item.target) keys.push(item.key)
      }
      else {
        if (url.indexOf((item.useBaseUrl ? props.baseUrl : "") + item.target) >= 0) keys.push(item.key)
      }
    })
    return keys
  }

  const [collapsed, setCollapsed] = useState(props.collapseDefaultValue ?? true)
  const [selectedKeys, setSelectedKeys] = useState(setKeys(props.match.url))

  const history = useHistory()

  const inputRef = React.useRef()

  const BuildMenu = () => {
    return getItemsChild(menu);
  }

  const getItemsChild = (items: SiderMenuProps[]) => {
    var realMenu = [];
    items.forEach(item => {
      if (item.requiredRoles) {
        if (item.requiredRoles.some(x => props.identity.roles?.some(r => r == x))) {
          realMenu.push({ key: item.key, label: t(item.label), icon: item.icon, children: item.children ? getItemsChild(item.children) : null });
        }
      } else {
        realMenu.push({ key: item.key, label: t(item.label), icon: item.icon, children: item.children ? getItemsChild(item.children) : null });
      }
    });
    return realMenu;
  }  
  
  const handleMenuClick = ({ key }) => {
    getTargetAndUseBaseUrl(menu, key);
  }

  const getTargetAndUseBaseUrl = (items: SiderMenuProps[] | undefined, key: string) => {
    let result;
    items?.forEach(element => {
      if (element.key == key) {
        if (element.target != undefined) {
          const params = window.location.search
          history.push((element.useBaseUrl ? props.baseUrl : "") + element.target + params)  
        }
      } else if(element.children) {
        result = getTargetAndUseBaseUrl(element.children, key);
      }
    });
  }

 
  return (
    <Layout className={"sider-menu"} style={{ margin: -10 }}>
      <Sider trigger={null} collapsed={collapsed} collapsedWidth={props.collapseWidth} width={props.width} style={{ minHeight: 'calc(-111px + 100vh)' }}>
        {props.collapsible &&
          <div className={"collapsible-panel"}>{collapsed ? < MenuUnfoldOutlined onClick={() => { if (props.onCollapseChange) props.onCollapseChange(!collapsed); setCollapsed(!collapsed) }} /> : <MenuFoldOutlined onClick={() => { if (props.onCollapseChange) props.onCollapseChange(!collapsed); setCollapsed(!collapsed) }} />}
          </div>
        }
        <Menu
          style={{ marginTop: 20 }}
          theme="dark"
          mode="inline"
          inlineCollapsed={collapsed}
          items={BuildMenu() as ItemType[]}
          onClick={handleMenuClick}
          selectedKeys={selectedKeys}
        />
      </Sider>
      <Layout>
        {props.children}
      </Layout>
    </Layout>

  )
}

export default withIdentity(withTranslation()(withRouter(SiderMenu as any)))
