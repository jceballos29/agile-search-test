import { CaretLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { useStep } from '../context/steps';
import { response } from '../data';

const { Title } = Typography;

export interface HeaderProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {}

const Header: React.FC<HeaderProps> = (props) => {
  const { t } = props;

  const history = useHistory();
  const { activeStep } = useStep();

  const page = 1;
  const pageSize = 20;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, response.count);

  return (
    <div className="navigation">
      <Button onClick={() => history.push('/')} className="back-button" icon={<CaretLeftOutlined />} type="text">
        {t('Back to normal search')}
      </Button>
      <Title className="central-title" level={3}>
        {activeStep.step === 3 ? (
          <>
            <span style={{ marginRight: 10 }}>
              {t('Showing {start} to {end} of {total} results')
                .replace('{start}', start.toString())
                .replace('{end}', end.toString())
                .replace('{total}', response.count.toString())}
            </span>
            <Tooltip title={t('Distinctively monetize cost effective networks for cross-media bandwidth')}>
              <ExclamationCircleOutlined style={{ fontSize: 18 }} />
            </Tooltip>
          </>
        ) : (
          t(activeStep.title)
        )}
      </Title>
    </div>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(Header)))));
