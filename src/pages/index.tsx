import { Button, Modal } from 'antd';
import { FC, useState } from 'react';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import ShellMetrix from 'src/components/metrix/shell-metrix';
import footerLogo from 'src/core/assets/footer-logo.png';
import logo from 'src/core/assets/logo.png';
import error404 from 'src/core/ui/error/error404';
import Shell from 'src/core/ui/shell';
import ShellNotification from '../components/systemNotification/shell-notification';
import { UserProfileProps, withUserProfile } from '../components/user-profile';
import { IdentityProps, withIdentity } from '../core/services/authentication';
import { getTopRightMenu } from '../menu';
import AdminPage from './admin';
import WhatsNewReport from './admin/WhatsNew/whatsNewReport';
import { AgileSearch } from './agile-search';
import GrantPage from './grants/grant-detail';
import HangfireAdmin from './hangfireAdmin';
import SearchResult from './home/grants';
import CalendarResult from './home/grants-calendar';
import FavoritesResult from './home/grants-favorites';
import HistoryResult from './home/grants-history';
import SubscriptionPage from './subscription';
import AgileSearchProvider from './agile-search/context';
interface IndexProps extends RouteComponentProps<any>, UserProfileProps, IdentityProps {}

const Index: FC<IndexProps> = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showManagerContent, setShowManagerContent] = useState(false);

  const onMenuClick = (item) => {
    if (item === 'whatsnew') {
      if (props.location.pathname.match('admin')) {
        setCollapsed(true);
        setShowManagerContent(true);
      } else {
        setCollapsed(true);
        setShowManagerContent(false);
      }
    }
  };

  const visibleFalse = () => {
    setCollapsed(false);
  };

  return (
    <Shell
      v2
      statusMode
      logo={logo}
      footerLogo={footerLogo}
      getTopRightMenu={getTopRightMenu(props.identity.roles ? props.identity.roles : [], props.userProfile.isAdmin, onMenuClick)}
    >
      <ShellMetrix>
        <ShellNotification>
          <Switch>
            <Route exact path={'/'} component={SearchResult} />
            <Route exact path={'/search'} component={SearchResult} />
            <Route exact path={`/search/:grantId`} component={GrantPage} />
            <Route exact path={`/agile-search`}>
              <AgileSearchProvider>
                <AgileSearch />
              </AgileSearchProvider>
            </Route>
            <Route exact path={`/favorites`} component={FavoritesResult} />
            <Route exact path={`/history`} component={HistoryResult} />
            <Route exact path={`/calendar`} component={CalendarResult} />
            <Route exact path={'/adminhangfire'} component={HangfireAdmin} />
            <Route exact path={`/subscriptions`} component={SubscriptionPage} />
            <Route exact path={`/admin`} component={AdminPage} />
            <Route component={error404} />
          </Switch>
        </ShellNotification>
        <Modal
          title={"What's New"}
          closable={false}
          width="80%"
          visible={collapsed}
          footer={[
            <Button key="back" type="primary" onClick={visibleFalse}>
              {'Ok'}
            </Button>,
          ]}
        >
          <WhatsNewReport manager={showManagerContent} />
        </Modal>
      </ShellMetrix>
    </Shell>
  );
};

export default withIdentity(withUserProfile(withRouter(Index)));
