import * as React from 'react'
import autobind from 'autobind-decorator'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Col, Layout, Menu, Row, Spin } from 'antd'
import { MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import ShellHeader from './shell-header'
import { withSize } from 'react-sizeme'
import EnGB from 'antd/es/locale/en_GB'
import EsEs from 'antd/es/locale/es_ES'
import FrFr from 'antd/es/locale/fr_FR'
import PtPt from 'antd/es/locale/pt_PT'
import DeDe from 'antd/es/locale/de_DE'
import ItIt from 'antd/es/locale/it_IT'
import { ConfigProvider } from 'antd'
import i18next from 'i18next'
import FooterView from './footer'
import SiderView, { SiderMenuProps } from './sider-menu'
import { container } from '../../inversify.config'
import HttpService from '../services/http.service'
import { IdentityProps, withIdentity } from '../services/authentication'
import Modal from 'antd/lib/modal/Modal'
const { Header, Content, Footer, Sider } = Layout
import image from '../assets/images/softwaremant.jpg'
import logo from '../assets/fi-group.png'
import { Certificate } from 'crypto'

export interface ShellSideMenuProps {
  width?: string
  collapsibleWidth?: string
  menu: SiderMenuProps[],
  collapsible?: boolean,
  collapseDefaultValue?: boolean,
  baseUrl?: string
}
interface ShellProps extends RouteComponentProps, WithTranslation, IdentityProps {
  logo?: any
  footerLogo?: any
  prefix?: string
  ensureCompanySelection?: boolean
  children?: React.ReactNode
  getTopMainMenu?: (t: (value: string) => string, screenWidth: number) => React.ReactNode[]
  getTopRightMenu?: (t: (value: string) => string, screenWidth: number) => React.ReactNode[]
  onMenuClick?: (key: string) => void
  footer?: React.ReactNode
  noLogin?: boolean
  availableLanguages?: string[]
  customMyApps?: boolean
  onMyAppsRequested?: () => void
  v2?: boolean
  sideMenu: ShellSideMenuProps
  className?: string
  statusMode?: boolean
  stickyDisabled?: boolean
}

interface ShellState {
  collapsed: boolean
  isBusy: boolean
  mouseMoving: boolean,
  showStatusWindow: boolean
}

export interface IsBusyInterface {
  isBusy: boolean
  setIsBusy: (isBusy: boolean) => void
}

export interface IsBusyComponentProps {
  busyContext: IsBusyInterface
}

const { Consumer, Provider } = React.createContext<IsBusyInterface | null>(null)
export function withBusyContext<T extends React.ComponentClass<any, any>>(Component: T) {
  return function ComponentBoundWithAppContext(props: any) {
    return <Consumer>{(busyContext) => <Component {...props} busyContext={busyContext} />}</Consumer>
  }
}

function getLanguage() {
  switch (i18next.language) {
    case 'es':
      return EsEs
    case 'en':
      return EnGB
    case 'fr':
      return FrFr
    case 'pt':
      return PtPt
    case 'de':
      return DeDe
    case 'it':
      return ItIt
  }
  return EnGB
}
class Shell extends React.Component<ShellProps, ShellState> {
  constructor(props: ShellProps) {
    super(props)
    this.state = {
      collapsed: this.props.sideMenu?.collapseDefaultValue ?? true,
      isBusy: false,
      mouseMoving: false,
      showStatusWindow: false
    }
  }

  async componentDidMount() {
    if (this.props.statusMode) {
      let httpService = container.get(HttpService)
      var result = await httpService.get<any>(this.props.identity.identityUrl + "/api/v1/applications/status/" + this.props.identity.applicationName)
      if (result.data == "Maintenance") {
        this.setState({ showStatusWindow: true })
      }
    }
  }

  @autobind
  private setIsBusy(isBusy: boolean) {
    this.setState({ isBusy: isBusy })
  }

  @autobind
  private toggle() {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }

  @autobind
  private handleMenuClick(e: any) {
    switch (e.key) {
      case 'logoff':
        //this.identityService.logOff();
        break
      case 'trigger':
        this.toggle()
        break
      default:
        if (this.props.onMenuClick) this.props.onMenuClick(e.key)
        break
    }
  }

  private getContent = () => {
    if (this.props.sideMenu) {
      return <SiderView baseUrl={this.props.sideMenu.baseUrl} collapseDefaultValue={this.props.sideMenu?.collapseDefaultValue} onCollapseChange={(value) => { this.setState({ collapsed: value }) }} collapsibleWidth={this.props.sideMenu.collapsibleWidth ?? 80} width={this.props.sideMenu.width ?? 200} collapsible={this.props.sideMenu.collapsible} menu={this.props.sideMenu.menu}>
        {this.props.children}
      </SiderView>
    }
    else return this.props.children
  }
  private timeout
  @autobind
  private setMouseMove(e: any) {
    this.setState({ mouseMoving: true })
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.setState({ mouseMoving: false }), 3000)
  }

  public render() {
    const { t } = this.props
    var width = (this.props as any).size.width
    const isBusyContext: IsBusyInterface = {
      isBusy: this.state.isBusy,
      setIsBusy: this.setIsBusy,
    }


    return (
      <ConfigProvider locale={getLanguage()}>
        <Spin spinning={this.state.isBusy}>
          <Provider value={isBusyContext}>
            <Layout onMouseMove={this.setMouseMove} onScroll={this.setMouseMove} className={!this.state.mouseMoving ? this.props.className : this.props.className + " mouseMoving"} style={{ minHeight: 'calc(100vh)', overflow: 'hidden' }}>
              <Header>
                <ShellHeader
                  className={this.props.className}
                  noLogin={this.props.noLogin}
                  availableLanguages={this.props.availableLanguages}
                  prefix={this.props.prefix}
                  logo={this.props.logo}
                  logoWidth={this.state.collapsed ? this.props.sideMenu?.collapsibleWidth ?? 80 : this.props.sideMenu?.width ?? 200}
                  getTopMainMenu={this.props.getTopMainMenu}
                  getTopRightMenu={this.props.getTopRightMenu}
                  ensureCompanySelection={this.props.ensureCompanySelection}
                  customMyApps={this.props.customMyApps}
                  onMyAppsRequested={this.props.onMyAppsRequested}
                  v2={this.props.v2}
                  stickyDisabled={this.props.stickyDisabled}
                />
              </Header>
              <Content style={{ overflow: 'auto' }}>
                <div style={{ minHeight: 'calc(100vh - 111px)' }}>
                  {this.getContent()}
                </div>
                {this.props.footer ? this.props.footer : <FooterView footerLogo={this.props.footerLogo} />}
              </Content>
            </Layout>
          </Provider>
        </Spin>
        {this.state.showStatusWindow &&
          <Modal
           
            centered
            open
            title={null}
            width={"1000px"}
            footer={null}
            closable={true}
            onCancel={() => this.setState({ showStatusWindow: false })}
          >

            <Row style={{ backgroundImage: `url(${image})`, height: "500px", backgroundPosition: 'center', margin : "-19px" }}>
              <Col span={3}>
                <img style={{ padding: '0 30px' }} alt="fi-logo" width={150} src={logo} />
              </Col>
              <Col span={21}>
                <div style={{ padding: 30 }}>
                  <p style={{ color: "rgb(0,0,164)", fontSize: 20 }}>{t("Maintenance work is being done in this application and the tool may have unexpected behaviors")}</p>
                </div>
              </Col>
            </Row>

          </Modal>
        }

      </ConfigProvider>
    )
  }
}
export default withIdentity(withTranslation()(withSize()(withRouter(Shell as any)) as any) as any) as any
