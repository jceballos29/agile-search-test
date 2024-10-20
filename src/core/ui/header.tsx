import * as React from 'react';
import { Menu, Row, Col } from 'antd';
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withIdentity, IdentityProps } from "../services/authentication";
import Link from './link'
import LoginBox from './login-box'
import LanguageBox from './language-box'

interface ShellHeaderProps extends IdentityProps, RouteComponentProps {
    ensureCompanySelection?: boolean
}

class ShellHeader extends React.Component<ShellHeaderProps> {
    public render() {

        var parts = this.props.location.pathname.split('/').filter(o => o != '');
        const firstPath = `/${parts.length > 0 ? parts[0] : "home"}`;
        var role = this.props.identity && this.props.identity.roles && this.props.identity.roles.length > 0 && this.props.identity.roles[0];

        return <Row>
            <Col span={16}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={[firstPath]}
                    style={{ lineHeight: '56px', minHeight: 56 }}>
                    <Menu.Item key='/home'><Link to='/'>Portal</Link></Menu.Item>
                    {(role == 'User' || role == 'Consultor' || role == 'Manager' || role == 'Administrator') && <Menu.Item key='/extranet'><Link to='/extranet'>Extranet</Link></Menu.Item>}
                    {(role == 'Consultor' || role == 'Manager' || role == 'Administrator') && <Menu.Item key='/rndplatform'><Link to='/rndplatform'>R&D Platform</Link></Menu.Item>}
                    {(role == 'Administrator') && <Menu.Item key='/identity/admin'><Link to='/identity/admin'>Identity</Link></Menu.Item>}
                </Menu>
            </Col>
            <Col span={8}>
                <Menu
                    className='right-menu'
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={[firstPath]}
                    style={{ lineHeight: '56px', minHeight: 56, textAlign: 'right' }}>
                    <Menu.Item><LoginBox ensureCompanySelection={this.props.ensureCompanySelection} /></Menu.Item>
                    <Menu.Item><LanguageBox /></Menu.Item>
                </Menu>
            </Col>
        </Row>
    }
}
export default withRouter(withIdentity(ShellHeader))