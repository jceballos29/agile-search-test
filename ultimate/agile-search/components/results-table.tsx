import { EyeOutlined, MoreOutlined, StarFilled, StarOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons'
import { Badge, Button, Dropdown, Space, Table, Tag, Tooltip } from 'antd'
import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Link, RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import { UserProfileProps, withUserProfile } from 'src/components/user-profile'
import { IdentityProps, withIdentity } from 'src/core/services/authentication'
import { CacheProps, withCache } from 'src/core/services/cache.service'
import HttpService from 'src/core/services/http.service'
import { container } from 'src/inversify.config'
import FileSaver from 'file-saver';
import { response } from '../data'

export interface ResultsTableProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {}

const ResultsTable: React.FC<ResultsTableProps> = (props) => {

  const {t} = props

  const history = useHistory()
  const httpService = container.get(HttpService);

  const columns: any[] = [
    {
      title: '',
      dataIndex: 'isFavorite',
      key: 'isFavorite',
      width: 48,
      align: 'center',
      render: (isFavorite: boolean) => (
        <Space>
          <Tooltip title={isFavorite ? t('Remove from favorites') : t('Add to favorites')}>
            <Button type="text" icon={isFavorite ? <StarFilled /> : <StarOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('Title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <Link to={`/search/${record.id}`} style={{ color: '#0000A4' }}>
          {t(title)}
        </Link>
      ),
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status: string) => <Badge status={status === 'Open' ? 'success' : status === 'Closed' ? 'processing' : 'default'} text={t(status)} />,
    },
    {
      title: t('Closing'),
      key: 'closingDate',
      align: 'center',
      width: 120,
      render: (_: string, record: any) => {
        if (record.periods && record.periods.length > 0) {
          return (
            <Tag color="volcano" style={{ margin: 0 }}>
              {record.periods[record.periods.length - 1].closingDate.split('T')[0]}
            </Tag>
          );
        }
        return null;
      },
    },
    {
      title: '',
      key: 'actions-grants',
      align: 'center',
      width: 48,
      render: (_: string, record: any) => (
        <Space wrap>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  label: t('See details'),
                  key: 'details',
                  icon: <EyeOutlined style={{ color: '#0000a4' }} />,
                  onClick: () => history.push(`/search/${record.id}`),
                },
                {
                  label: t('Download ID Card'),
                  key: 'download',
                  icon: <VerticalAlignBottomOutlined style={{ color: '#0000a4' }} />,
                  onClick: async () => {
                    const result = await httpService.get(`api/v1/grants/grantSlide/${record.id}`, {
                      responseType: 'arraybuffer',
                    });
                    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
                    (FileSaver as any).saveAs(blob, `${record.title}.pptx`);
                  },
                },
              ] as any,
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return <Table rowKey={(record: any) => record.id} columns={columns} dataSource={response.items} pagination={false} size="middle" />
}

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(ResultsTable)))))