'use client';
import { StarFilled, StarOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';

import grantCardImg from 'src/assets/grant-card-img.png';
import HttpService from 'src/core/services/http.service';
import { container } from 'src/inversify.config';
import FileSaver from 'file-saver';

const { Title, Paragraph } = Typography;

export interface GrantCardProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {
  grant: any;
}

const GrantCard: React.FC<GrantCardProps> = (props) => {
  const { t, grant, userProfile } = props;
	const httpService = container.get(HttpService);

  return (
    <Card bodyStyle={{ padding: 12 }}>
      <Row gutter={[16, 16]}>
        <Col span={2}>
          <Tag
            color={grant.status === 'Open' ? 'success' : grant.status === 'error' ? 'processing' : 'default'}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            {t(grant.status)}
          </Tag>
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
            <img src={grantCardImg} alt="Grant Card" style={{ width: '100%', objectFit: 'fill', objectPosition: 'center' }} />
          </figure>
        </Col>
        <Col span={17}>
          <Space size={0} direction="horizontal" style={{ marginBottom: 8 }}>
            {grant.annuities &&
              grant.annuities.map((annuity) => <Tag color="red">{t(userProfile.annuities.find((a) => a.id === annuity).name)}</Tag>)}
            {grant.periods && grant.periods.length > 0 && (
              <Tag color="volcano">
                {t('Closing Date')} {grant.periods[grant.periods.length - 1].closingDate.split('T')[0]}
              </Tag>
            )}
            <Tag color="magenta">{t(userProfile.countries.find((c) => c.code === grant.countryId).name)}</Tag>
            {grant.locations &&
              grant.locations.map((location) => <Tag color="gold">{t(userProfile.locations.find((l) => l.id === location).name)}</Tag>)}
          </Space>
          <Title level={5}>
            <Link to={`/search/${grant.id}`}>{t(grant.title)}</Link>
          </Title>
          <Paragraph ellipsis={{ rows: 2 }}>{t(grant.scope)}</Paragraph>
          <Space wrap direction="horizontal" size={0}>
            {grant.typologies &&
              grant.typologies.map((typology: any) => (
                <Tag key={typology} color="purple">
                  {t(userProfile.sectors.find((s) => s.id === typology).name)}
                </Tag>
              ))}
          </Space>
          <Space wrap direction="horizontal" size={0}>
            {grant.sectors &&
              grant.sectors.map((sector: any) => (
                <Tag key={sector} color="default">
                  {t(userProfile.sectors.find((s) => s.id === sector).name)}
                </Tag>
              ))}
          </Space>
        </Col>
        <Col span={5}>
          <Space size={0} direction="horizontal" style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={grant.isFavorite ? t('Remove from favorites') : t('Add to favorites')}>
              <Button type="text" icon={grant.isFavorite ? <StarFilled /> : <StarOutlined />} />
            </Tooltip>
            <Tooltip title={t('Download ID Card')}>
              <Button type="text" icon={<VerticalAlignBottomOutlined />} onClick={ async () => {
                    const result = await httpService.get(`api/v1/grants/grantSlide/${grant.id}`, {
                      responseType: 'arraybuffer',
                    });
                    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
                    (FileSaver as any).saveAs(blob, `${grant.title}.pptx`);
                  }}/>
            </Tooltip>
          </Space>
          <Space wrap size={[0, 8]}>
            {grant.beneficiaryTypesId.map((beneficiaryType: any) => (
              <Tag key={beneficiaryType} color="cyan">
                {t(userProfile.beneficiaryTypes.find((b) => b.id === beneficiaryType).name)}
              </Tag>
            ))}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(GrantCard)))));
