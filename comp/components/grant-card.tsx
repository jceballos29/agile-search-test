import { Button, Card, Col, Row, Space, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { StarFilled, StarOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';

import grantCardImg from 'src/assets/grant-card-img.png';

const { Title, Paragraph } = Typography;

export interface GrantCardProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {
  grant: any;
}

const GrandCard: React.FC<GrantCardProps> = (props) => {
  const { t, grant, userProfile } = props;

  console.log({
    grant,
    userProfile,
  });

  return (
    <Card bodyStyle={{ padding: 12 }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space size="small" direction="horizontal">
          <Tag color={grant.status === 'Open' ? 'success' : grant.status === 'error' ? 'processing' : 'default'}>{t(grant.status)}</Tag>
          {grant.periods && grant.periods.length > 0 && (
            <Tag color="volcano">
              {t('Closing Date')} {grant.periods[grant.periods.length - 1].closingDate.split('T')[0]}
            </Tag>
          )}
          <Tag color="magenta">{t(userProfile.countries.find((c) => c.code === grant.countryId).name)}</Tag>
          {grant.locations && grant.locations.length > 0 && (
            <Tag color="gold">{t(userProfile.locations.find((l) => l.id === grant.locations[0]).name)}</Tag>
          )}
        </Space>
        <Space size="small" direction="horizontal">
          <Tooltip title={grant.isFavorite ? t('Remove from favorites') : t('Add to favorites')}>
            <Button type="text" icon={grant.isFavorite ? <StarFilled /> : <StarOutlined />} />
          </Tooltip>
          <Tooltip title={t('Download ID Card')}>
            <Button type="text" icon={<VerticalAlignBottomOutlined />} />
          </Tooltip>
        </Space>
      </div>
      <Row gutter={8}>
        <Col span={1}>
          <figure
            style={{
              margin: 0,
              width: 48,
              height: 48,
              overflow: 'hidden',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          >
            <img src={grantCardImg} alt="Grant Card" style={{ width: '100%' }} />
          </figure>
        </Col>
        <Col span={17}>
          <Title level={5}>
            <Link to={`/search/${grant.id}`}>{t(grant.title)}</Link>
          </Title>
          <Paragraph ellipsis={{ rows: 2 }}>{t(grant.scope)}</Paragraph>
          <Space wrap direction="horizontal">
            {grant.sectors.map((sector: any) => (
              <Tag key={sector} color="default">
                {t(userProfile.sectors.find((s) => s.id === sector).name)}
              </Tag>
            ))}
          </Space>
        </Col>
        <Col span={6}>
          <Space wrap> {
            grant.beneficiaryTypesId.map((beneficiaryType: any) => (
              <Tag key={beneficiaryType} color="cyan">
                {t(userProfile.beneficiaryTypes.find((b) => b.id === beneficiaryType).name)}
              </Tag>
            ))
            }</Space>
        </Col>
      </Row>
    </Card>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(GrandCard)))));
