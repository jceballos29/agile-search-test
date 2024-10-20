import * as React from 'react';
import { Tag } from 'antd';
import { LeftCircleOutlined, UserOutlined } from '@ant-design/icons';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ShellBreadcrumb from './shell-breadcrumb';

interface ContentHeaderProps extends RouteComponentProps {
    title: string | React.ReactElement,
    subtitle?: string | React.ReactElement,
    type?: string,
    showBack?: boolean,
    showBackLink? : string
    icon?: string,
    tags?: string[];
    hideBreadcrumb?: boolean
}

class ContentHeader extends React.Component<ContentHeaderProps, any> {
    public render() {
        return <div className="content-header">
            <div>
                {this.props.type && <span data-testid="content-header-type" className="content-header-type" style={{ textTransform: 'uppercase', fontSize: 12 }}>{this.props.type}</span>}
            {this.props.icon && <UserOutlined style={{ float: 'left', fontSize: 36, marginTop: 5 }} />}
                <div style={{ marginLeft: this.props.icon ? 50 : 0, marginTop: 0}}>
                    <h3 data-testid="content-header" style={{ marginBottom: 7 }}>{this.props.showBack && <><LeftCircleOutlined style={{ cursor: 'pointer', fontSize: '26px' }} onClick={() => { if (!this.props.showBackLink) this.props.history.go(-1); else this.props.history.push(this.props.showBackLink, this.props.location.state) }} /><span>&nbsp;</span></>}{this.props.title} {this.props.tags && this.props.tags.map(tag => <Tag key={tag} color='#2db7f5'>{tag}</Tag>)}</h3>
                    {this.props.subtitle && <span className="content-header-type" style={{ textTransform: 'uppercase', fontSize: 16 }}>{this.props.subtitle}</span>}
                    {
                        !this.props.hideBreadcrumb && <ShellBreadcrumb />
                    }
                </div>
            </div>
        </div>
    }
}
export default withRouter(ContentHeader);