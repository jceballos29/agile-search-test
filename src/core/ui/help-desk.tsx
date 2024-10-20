import * as React from 'react';
import { withIdentity, IdentityProps } from "../services/authentication";
import { Avatar, Menu } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next'
import { container } from 'src/inversify.config';
import { PreferencesService } from 'src/core/services/preferences.service';
import moment from 'moment';
import i18next from 'i18next';
import { NavItem } from './shell-header';
import HttpService from "../services/http.service";
import src from '../assets/images/helpDesk.png';

const MenuItem = Menu.Item;

interface HelpDeskProps extends WithTranslation, IdentityProps {
  isMobileOrTablet?: boolean
}

interface HelpDeskState {
}

class HelpDesk extends React.Component<HelpDeskProps, HelpDeskState> {

  constructor(props: HelpDeskProps) {
    super(props);
    this.state = {
    }

  }

  UNSAFE_componentWillMount() {

  }

  private isEmployee = (email?: string) => {
    var patterns = ['@fi-group.com', '@f-iniciativas.'];
    return email && patterns.filter((e) => email.toLowerCase().includes(e)).length > 0;
  }

  public render() {
    const { t, identity } = this.props;

    const helpdeskUrl = this.isEmployee(identity.email) ? 'https://figroup.freshservice.com' : 'https://figroup.freshworks.com/login/auth/contacts?client_id=78368727158800390&redirect_uri=https%3A%2F%2Ffigroup.freshdesk.com%2Ffreshid%2Fcustomer_authorize_callback'

    return <NavItem key="helpdesk" title={t("Helpdesk")}
      target="_blank"
      to={helpdeskUrl}
      icon={<Avatar style={{ width: "35px" }} size={this.props.isMobileOrTablet ? "small" : "default"} src={src} />}
    >
    </NavItem>

  }
}
export default withTranslation()(withIdentity(HelpDesk));