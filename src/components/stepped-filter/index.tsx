import React, { FC, useEffect, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Steps, Radio, RadioChangeEvent } from 'antd';
import debounce from 'lodash/debounce';
import './stepped-filter.less';

const SteppedFilter: FC<
  {
    onChange?: (value: any[]) => void;
    value?: any[];
  } & WithTranslation
> = ({ t, onChange, value }) => {
  const [activeStep, setActiveStep] = useState(0);

  const onStepSelect = debounce((value: string) => {
    onChange([]);
  }, 800);
  return (
    <Steps direction={'vertical'} current={activeStep} onChange={(current: number) => setActiveStep(current)}>
      <Steps.Step
        description={
          <div>
            <h4>{t('Company Size')}</h4>
            <Radio.Group defaultValue={'large'} onChange={(e: RadioChangeEvent) => console.log(e)}>
              <Radio.Button value="large">
                <div className={'step-option'}>
                  <span>{t('Large')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="medium">
                <div className={'step-option'}>
                  <span>{t('Medium')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="small">
                <div className={'step-option'}>
                  <span>{t('Small')}</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      />
      <Steps.Step
        description={
          <div>
            <h4>{t('Location')}</h4>
            <Radio.Group disabled={activeStep < 1} defaultValue onChange={(e: RadioChangeEvent) => console.log(e)}>
              <Radio.Button value="national">
                <div className={'step-option'}>
                  <span>{t('National')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="medium">
                <div className={'step-option'}>
                  <span>{t('Autonomous Community')}</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      />
      <Steps.Step
        description={
          <div>
            <h4>{t('Mode')}</h4>
            <Radio.Group disabled={activeStep < 2} onChange={(e: RadioChangeEvent) => console.log(e)}>
              <Radio.Button value="subvention">
                <div className={'step-option'}>
                  <span>{t('Subvention')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="loan">
                <div className={'step-option'}>
                  <span>{t('Loan')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="mixed">
                <div className={'step-option'}>
                  <span>{t('Mixed')}</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      />
      <Steps.Step
        description={
          <div>
            <h4>{t('Participation Mode')}</h4>
            <Radio.Group disabled={activeStep < 3} onChange={(e: RadioChangeEvent) => console.log(e)}>
              <Radio.Button value="individual">
                <div className={'step-option'}>
                  <span>{t('Individual')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="consortium">
                <div className={'step-option'}>
                  <span>{t('Consortium')}</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      />
      <Steps.Step
        description={
          <div>
            <h4>{t('Project Type')}</h4>
            <Radio.Group disabled={activeStep < 4} onChange={(e: RadioChangeEvent) => console.log(e)}>
              <Radio.Button value="id">
                <div className={'step-option'}>
                  <span>{t('I+D')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="idi">
                <div className={'step-option'}>
                  <span>{t('I+D+i')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="contract">
                <div className={'step-option'}>
                  <span>{t('Contract')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="ee">
                <div className={'step-option'}>
                  <span>{t('EE')}</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      />
      <Steps.Step
        description={
          <div>
            <h4>{t('Can opt to minimis?')}</h4>
            <Radio.Group defaultValue={'yes'} disabled={activeStep < 5} onChange={(e: RadioChangeEvent) => console.log(e)}>
              <Radio.Button value="yes">
                <div className={'step-option'}>
                  <span>{t('Yes')}</span>
                </div>
              </Radio.Button>
              <Radio.Button value="no">
                <div className={'step-option'}>
                  <span>{t('No')}</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      />
    </Steps>
  );
};

export default withTranslation()(SteppedFilter);
