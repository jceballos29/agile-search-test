import { FC } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Tabs, TabsProps } from 'antd'
import { withUserProfile } from '../../../components/user-profile'
import StatisticsGrants from './StatisticsGrants'
import StatisticsFilters from './StatisticsFilters';

interface StatisticsIndexProps extends WithTranslation { }

const StatisticsIndex: FC<StatisticsIndexProps> = (props) => {
  const { t } = props;

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('Grants'),
      children: <StatisticsGrants />,
    },
    {
      key: '2',
      label: t('Filters'),
      children: <StatisticsFilters />,
    }
  ];


  return (
    <Tabs tabPosition='left' defaultActiveKey="1" items={items} />
  )
}
export default withUserProfile(withTranslation()(StatisticsIndex))