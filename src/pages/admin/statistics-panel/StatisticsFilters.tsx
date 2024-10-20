import { withUserProfile } from '../../../components/user-profile'
import { withTranslation, WithTranslation } from 'react-i18next'
import { FC, useEffect, useState } from 'react'
import { Button, Table } from 'antd'
import { FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import HttpService from '../../../core/services/http.service'

interface StatisticsFiltersProps extends WithTranslation { }

const StatisticsFilters: FC<StatisticsFiltersProps> = (props) => {
  const { t } = props;
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [countRecords, setCountRecords] = useState(0)

  const getFilterStatistic = () => {
    setLoading(true)
    fetch(`${process.env.PUBLIC_URL}/api/v1/statistics/GetSearchFilterStatistics`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${HttpService.accessToken}`
      })
    })
      .then(res => res.json()).then(resData => {
        let totalLogs = resData.totalLogs;
        setCountRecords(totalLogs)
        const newData = Object.entries(resData).map(([key, value]) => ({
          filter: t(key),
          value: value.toString()
        })) as unknown as Array<{ filter: string; value: string }>
        newData.pop()
        setData(newData)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getFilterStatistic()
  }, [t])

  const columns = [
    {
      title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Filter')} <FilterOutlined /></span>,
      dataIndex: "filter",
      key: 'filter'
    },
    {
      title: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t('Value')} <SearchOutlined /></span>,
      dataIndex: "value",
      key: 'value',
      sorter: (a, b) => a.value - b.value
    }
  ]

  return (
    <>
      <Button
        loading={loading} onClick={getFilterStatistic}
        icon={<ReloadOutlined />} style={{ margin: '0 10px 15px 0' }}
      />
      <span>{t("totalLogs")}: {countRecords}</span>
      <Table columns={columns} dataSource={data} pagination={false} />
    </>
  )
}

export default withUserProfile(withTranslation()(StatisticsFilters))