import * as React from 'react'
import { Breadcrumb } from 'antd'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { HomeFilled } from '@ant-design/icons'
import { withTranslation, WithTranslation } from 'react-i18next'
import { CacheProps, TimeType, withCache } from '../services/cache.service'

const routes = [
  { path: '/identity', breadcrumb: 'Identity' },
  { path: '/identification', breadcrumb: 'Identification' },
  { path: '/identity/admin/users', breadcrumb: 'Users' },
]

const excludePaths = ['/']

export function registerExcludePaths(paths: string[]) {
  paths.forEach((e => {
    if (excludePaths.indexOf(e) < 0)
      excludePaths.push(e)
  }))
}

export function registerBreadcrumbComponents(path: any, component: any) {
  routes.push({
    path,
    breadcrumb: component
  })
}

interface ShellBreadcrumbsProps extends RouteComponentProps {

}

class ShellBreadcrumbs extends React.Component<ShellBreadcrumbsProps & WithTranslation & CacheProps & { breadcrumbs: Array<React.ReactNode | string> }> {
  public render() {
    const { t } = this.props
    let { location } = this.props
    let fixedTitles = [{ url: '/rndplatform', title: t('R&D Platform') }, { url: '/pmo', title: t('Timesheet') }]
    let titles = [...fixedTitles, ...(location.state ? ((location.state as any).titles || []) : [])].distinct(o => o.url).toArray() as { url: string, title: string }[]
    function BreadcrumbItem(props: any) {
      let titleItem = titles.firstOrDefault(o => o.url == props.breadcrumb.match.url || o.url == `${process.env.PUBLIC_URL}${props.breadcrumb.match.url}`)
      if (titleItem) {
        if (props.cache)
          props.cache.saveGlobal(props.breadcrumb.match.url, titleItem.title,
            {
              value: 30,
              type: TimeType.Days
            })

        return <span>{t(titleItem.title)}</span>
      }
      var title = undefined
      if (props.cache)
        title = props.cache.getGlobal(props.breadcrumb.match.url)
      return title ? <span>{t(title)}</span> : <span>{t(props.breadcrumb.breadcrumb.props.children)}</span>
    }

    return <Breadcrumb separator=">" >
      <Breadcrumb.Item >
        <Link to={{ pathname: "/", state: { titles: "" } }}>
          <HomeFilled style={{ color: '#00aeff', fontSize: 20, height: 20, width: 20, marginRight: 6 }} />
          {this.props.breadcrumbs && this.props.breadcrumbs.length <= 1 ? this.props.t("Home") : ""}
        </Link>
      </Breadcrumb.Item>
      {this.props.breadcrumbs.slice(0, -1).map((breadcrumb: any, index) => {
        let currentUrl = `${process.env.PUBLIC_URL}${breadcrumb.match.url}`
        let currentTitles = [...fixedTitles, ...titles.filter(o => currentUrl.startsWith(o.url) || breadcrumb.match.url.startsWith(o.url))].distinct(o => o.url)
        return <Breadcrumb.Item key={breadcrumb.key}>
          <Link to={{ pathname: breadcrumb.match.url, state: { titles: currentTitles } }}>
            {<BreadcrumbItem breadcrumb={breadcrumb} cache={this.props.cache} />}
          </Link>
        </Breadcrumb.Item>
      })}
    </Breadcrumb>
  }
}

export default withCache(withTranslation()(withBreadcrumbs(routes, {
  excludePaths: excludePaths
})(withRouter(ShellBreadcrumbs) as any) as any) as any)