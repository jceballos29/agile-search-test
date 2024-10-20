import * as React from 'react';
import autobind from "autobind-decorator";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { loadPage } from '../utils/nav';
import { withBusyContext, IsBusyComponentProps } from './shell';

const externalRoutes: NavItem[] = [
    { path: '/', reload: false },
    { path: '/home', reload: false },
    { path: '/home/admin', reload: false },
    { path: '/identity', reload: false },
    { path: '/extranet', reload: false },
    { path: '/extranet-es', reload: false },
    { path: '/extranet-fr', reload: false },
    { path: '/pmo', reload: false },
    { path: '/scanner', reload: false },
    { path: '/scanner-cl', reload: false },
    { path: '/receipts', reload: false },
    { path: '/receipts-es', reload: false },
    { path: '/grants', reload: false },
    { path: '/grants/subscriptions', reload: false },
    { path: '/grants/admin', reload: false },
    { path: '/grants-es', reload: false },
    { path: '/rndplatform', reload: false },
    { path: '/rndplatform-es', reload: false },
    { path: '/docs', reload: false },
    { path: '/identity/account/login', reload: true },
    { path: '/identity/account/logout', reload: true },
    { path: '/identity/profile', reload: false },
    //{ path: '/identity/admin', reload: false },
    { path: '/identity/home', reload: false },
    { path: '/onedata', reload: false },
    { path: '/fibrain', reload: false },
    { path: '/onedata/admin', reload: false },
    { path: '/masterdata', reload: false },
    { path: '/masterdata/admin', reload: false },
    { path: '/signature', reload: false },
    { path: '/projecttracking', reload: false },
    { path: '/finder', reload: false },
    { path: '/tms', reload: false },
    { path: '/missions', reload: false },
    { path: '/rndgb', reload: false },
    { path: '/rndes', reload: false },
    { path: '/rndca', reload: false },
    { path: '/rndge', reload: false }

];

interface NavigationObject {
    pathname: string,
    state: any
}

interface LinkProps extends RouteComponentProps, IsBusyComponentProps {
    to: string | NavigationObject,
    onNavigate?: (url: string) => void,
    children: React.ReactNode
}

interface NavItem {
    path: string,
    reload: boolean
}

interface LinkState {

}

class Link extends React.Component<LinkProps, LinkState> {
    constructor(props: LinkProps) {
        super(props);
    }

    @autobind
    private loadPage() {
        this.props.busyContext.setIsBusy(true);
        navigate(this.props.history, this.props.to, url => {
            this.props.busyContext.setIsBusy(false);
            if (this.props.onNavigate) {
                this.props.onNavigate(url);
            }
        });
    }

    public render() {
        return <a style={{ display: 'inline-block' }} onClick={this.loadPage}>{this.props.children}</a>
    }
}

export function navigate(history: any, to: string | NavigationObject, onNavigate?: (url: string) => void) {
    var toPart;
    var state = {};
    if (typeof to === 'object') {
        const navObj = to as NavigationObject;
        toPart = navObj.pathname;
        state = navObj.state || {};
    } else {
        toPart = to as string;
    }

    if (onNavigate)
        onNavigate(toPart);
    const getLocation = function (href: any) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };
    const path = getLocation(toPart).pathname;
    var item = externalRoutes.filter(o => o.path == path);
    var whereAmI = externalRoutes.filter(o => window.location.pathname.startsWith(o.path)).slice(-1);

    if (item.length > 0 && (whereAmI.length == 0 || whereAmI[0].path != path)) {
        loadPage(toPart, history, item[0].reload);
    } else {
        history.push({ pathname: path, state: state });
    }
}
export default withRouter(withBusyContext(Link));