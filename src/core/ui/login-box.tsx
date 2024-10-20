import * as React from 'react'
import { withIdentity, IdentityProps } from "../services/authentication"
import { Avatar, Badge, Menu } from 'antd'
import { BookOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { withTranslation, WithTranslation } from 'react-i18next'
import Link from 'src/core/ui/link'
import { isNullOrWhitespace } from 'src/core/utils/object'
import { getGravatar } from 'src/core/utils/gravatar'
import { container } from 'src/inversify.config'
import { PreferencesService } from 'src/core/services/preferences.service'
import { NavItem } from './shell-header'
import ProfileView from './profile-ui'
import userIcon from '../assets/images/userImage.png'

let MenuItem = Menu.Item

interface LoginBoxProps extends IdentityProps, WithTranslation {
  ensureCompanySelection?: boolean
  isMobileOrTablet?: boolean
  v2?: boolean
}

interface LoginBoxState {
  currentCompanyId: string | undefined,
  currentCompanyTitle: string | undefined
  showProfile: boolean
}

class LoginBox extends React.Component<LoginBoxProps, LoginBoxState> {
  private readonly preferencesService: PreferencesService

  constructor(props: LoginBoxProps) {
    super(props)
    this.state = {
      currentCompanyId: undefined,
      currentCompanyTitle: undefined,
      showProfile: false
    }
    this.handleClick = this.handleClick.bind(this)
    this.preferencesService = container.get(PreferencesService)
  }


  private handleClick(key: any) {
    if (key.key == 'logout') {
      this.props.identity.logout()
    }

  }

  public render() {
    const { t } = this.props
    if (!this.props.identity) {
      return <Link to='/identity/account/login'>{t("Login")}</Link>
    }
    var displayName = `${this.props.identity.firstName || ''} ${this.props.identity.lastName || ''}`
    if (isNullOrWhitespace(displayName)) {
      displayName = this.props.identity.profile.name
    }
    var avatarSrc = getGravatar(this.props.identity.email || "gravatar@tempuri.org", 32)


    if (this.props.v2)
      return <>

        <NavItem key={'loginBox'}
          icon={<Badge dot={false}><div onClick={() => this.setState({ showProfile: true })}><Avatar style={{ border: "solid 4px lightgray" }}  icon={<UserOutlined />} size={40} shape="circle" src={avatarSrc} /></div> </Badge>}
          title={"  "}
        >

        </NavItem>
        {this.state.showProfile && <ProfileView onClose={() => this.setState({ showProfile: false })}></ProfileView>}
      </>


    else {
      return <NavItem key={'loginBox'}
        icon={<Avatar icon={<UserOutlined />} size='small' shape="circle" src={avatarSrc} style={{ width: 40 }} />}
        title={displayName}
        subMenu={
          <Menu onClick={this.handleClick} >
            <MenuItem key="user">
              <UserOutlined style={{ marginRight: 10 }} />
              <Link to='/identity/profile'>{t('Your Profile')}</Link>
            </MenuItem>
            {this.props.ensureCompanySelection && <MenuItem key="changeCompany">
              <BookOutlined style={{ marginRight: 10 }} />
              <Link to='/home/companies/select'>{t('Change company')}</Link>
            </MenuItem>}
            <MenuItem key="logout">
              <LogoutOutlined style={{ marginRight: 10 }} />
              <span>{t('Close session')}</span>
            </MenuItem>
          </Menu>
        }>
      </NavItem>
    }

  }

}
export default withTranslation()(withIdentity(LoginBox))