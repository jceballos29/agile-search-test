import * as React from 'react'
import { Tooltip, Menu, Dropdown } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { withIdentity, IdentityProps } from '../services/authentication'
import { withTranslation, WithTranslation } from 'react-i18next'
import Link from './link'
import LoginBox from './login-box'
import HelpDesk from './help-desk'
import LanguageBox from './language-box'
import windowSize from 'react-window-size'
import { withSize } from 'react-sizeme'
import autobind from 'autobind-decorator'
import Avatar from 'antd/lib/avatar/avatar'
import MyAppsView from './my-apps'
import Sticky from 'react-sticky-el';

export interface NavItemProps {
  title: string | React.ReactNode
  to?: string
  target?: string
  icon?: React.ReactNode
  subMenu: Menu
  iconOnly?: boolean
  selected?: boolean
  v2?: boolean


}

function WrapInDropdown(props: any) {
  if (props.subMenu) {
    return (
      <Dropdown overlay={props.subMenu} trigger={['click']}>
        {(() => {
          if (props.to) {
            return (
              <Link to={props.to || ''} className="ant-dropdown-link" style={{ height: 44 }}>
                {props.children}
              </Link>
            )
          }
          return (
            <div className="ant-dropdown-link" style={{ height: 44 }}>
              {props.children}
            </div>
          )
        })()}
      </Dropdown>
    )
  }

  if (props.to) {
    if (props.target)
      return (
        <a href={props.to || ''} target={props.target}>
          {props.children}
        </a>
      )
    return <Link to={props.to}>{props.children}</Link>
  }
  return props.children
}

class NavItemClass extends React.Component<NavItemProps> {
  public render() {
    var width = (this.props as any).windowWidth
    var isMobileOrTable = width < 768
    let icon: any = undefined
    let title: React.ReactNode = undefined
    let iconOnly = this.props.iconOnly && !isMobileOrTable
    if (this.props.icon) {
      icon = this.props.icon
    }
    if (typeof this.props.title === 'string') {
      title = <span>{this.props.title}</span>
    } else {
      title = this.props.title
    }
    if (this.props.subMenu && isMobileOrTable) {
      return (
        <div className="navbar-items">
          <div className={`navbar-item${this.props.selected ? ' selected' : ''}`}>
            {icon && (
              <div style={{ float: 'left' }}>
                <Tooltip title={iconOnly && typeof this.props.title === 'string' ? this.props.title : ''} placement="bottom">
                  {icon}
                </Tooltip>
              </div>
            )}
            {!iconOnly && title}
          </div>
          {this.props.subMenu}
        </div>
      )
    }
    return (
      <div className={`navbar-item${this.props.selected ? ' selected' : ''}`}>
        <WrapInDropdown subMenu={this.props.subMenu} to={this.props.to} target={this.props.target}>
          {icon && (
            <div style={{ float: 'left' }}>
              <Tooltip title={iconOnly && typeof this.props.title === 'string' ? this.props.title : ''} placement="bottom">
                {icon}
              </Tooltip>
            </div>
          )}
          {!iconOnly && title}
        </WrapInDropdown>
      </div>
    )
  }
}
export const NavItem = windowSize(NavItemClass as any) as any

interface ShellHeaderProps extends IdentityProps, WithTranslation, RouteComponentProps {
  prefix?: string
  getTopMainMenu?: (t: (value: string) => string, isMobile: boolean) => React.ReactNode[]
  getTopRightMenu?: (t: (value: string) => string, isMobile: boolean) => React.ReactNode[]
  logo?: any
  logoWidth?: string
  ensureCompanySelection?: boolean
  noLogin?: boolean
  hideHelpdesk?: boolean
  hideMyApps?: boolean
  stickyDisabled?: boolean
  availableLanguages?: string[]
  customMyApps?: boolean
  onMyAppsRequested?: () => void
  v2?: boolean,
  className?: string
}

interface ShellHeaderState {
  collapsed: boolean
  onAppShowns: boolean
  logoWitdh: string
}

class ShellHeader extends React.Component<ShellHeaderProps, ShellHeaderState> {
  public constructor(props: ShellHeaderProps) {
    super(props)
    this.state = {
      collapsed: true,
      onAppShowns: false,
      logoWitdh: this.props.logoWidth ?? "80px"
    }
  }

  componentWillReceiveProps(nextProps: ShellHeaderProps) {
    if (this.props.logoWidth != nextProps.logoWidth)
      this.setState({ logoWitdh: nextProps.logoWidth })
  }


  @autobind
  public handleHamburger() {
    this.setState({ collapsed: !this.state.collapsed })
  }

  @autobind
  public someMenuClicked(e: any) {
    if (!this.state.collapsed) {
      setTimeout(() => this.setState({ collapsed: true }), 100)
    }
  }

  public render() {
    const { t } = this.props
    var width = (this.props as any).size.width
    var isMobileOrTablet = width <= 768
    var parts = this.props.location.pathname.split('/').filter((o) => o != '')
    const firstPath = `/${parts.length > 0 ? parts[0] : this.props.prefix ? this.props.prefix : ''}`
    var role = this.props.identity && this.props.identity.roles && this.props.identity.roles.length > 0 && this.props.identity.roles[0]
    var topMainMenu = this.props.getTopMainMenu ? this.props.getTopMainMenu(t, width) : []
    var topRightMenu = this.props.getTopRightMenu ? this.props.getTopRightMenu(t, width) : []
    return (
      <Sticky wrapperClassName={"sticky-container"} disabled={this.props.stickyDisabled} stickyClassName="menu-sticky" topOffset={80}>
        <>

          <div className="navbar" onClickCapture={this.someMenuClicked}>
            <nav key="1" className="navbar-items navbar-items-left">
              <NavItem
                key="/"
                to="/"
                title={
                  <>
                    <div style={{ display: "flex" }}>
                      <div className={"logo-image-container"} style={{ width: this.state.logoWitdh, transition: "all 0.2s", textAlign: 'center' }}>
                        <img src={this.props.logo} height={24} />
                      </div>
                      <div className={"logo-border"}></div>
                      <span id="logo-text">Helping ideas grow</span>
                    </div>
                  </>
                } />
              {isMobileOrTablet && (
                <div className="navbar-item navbar-item-toggle" onClick={this.handleHamburger}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              )}
              {(!this.state.collapsed || !isMobileOrTablet) && topMainMenu}
            </nav>
            {(!this.state.collapsed || !isMobileOrTablet) && (
              <nav key="2" className="navbar-items navbar-items-right">
                {topRightMenu}
                <LanguageBox isMobileOrTablet={isMobileOrTablet} availableLanguages={this.props.availableLanguages} />
                {!this.props.hideHelpdesk && <HelpDesk isMobileOrTablet={isMobileOrTablet} />}
                {!this.props.hideMyApps && (
                  <div
                    className={`navbar-item`}
                    onClick={() => {
                      if (this.props.onMyAppsRequested) {
                        this.props.onMyAppsRequested()
                      }
                      else {
                        this.setState({ onAppShowns: true })
                      }
                    }}
                  >
                    <a style={{ display: 'inline-block' }}>
                      <div style={{ float: 'left' }}>
                        <AppstoreOutlined
                          style={{
                            fontSize: '35px',
                            marginTop: '12px',
                            marginLeft: '4px',
                            marginRight: '4px',
                            color: '#0000A9',
                            width: '35px',
                            background: 'white',
                          }}
                        />
                      </div>
                      <span style={{ marginLeft: '0px' }}>{t('My Apps')}</span>
                    </a>
                  </div>
                )}
                {!this.props.noLogin && <LoginBox v2={this.props.v2} isMobileOrTablet={isMobileOrTablet} ensureCompanySelection={this.props.ensureCompanySelection} />}
              </nav>
            )}
          </div>
          <MyAppsView
            className={this.props.className}
            visible={this.state.onAppShowns}
            onClose={() => {
              this.setState({ onAppShowns: false })
            }}
          ></MyAppsView>
        </>
      </Sticky>
    )
  }
}
export default withTranslation()(withSize()(withRouter(withIdentity(ShellHeader))) as any) as any
