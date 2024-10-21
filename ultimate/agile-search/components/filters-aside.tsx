import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { UserProfileProps, withUserProfile } from 'src/components/user-profile';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { CacheProps, withCache } from 'src/core/services/cache.service';
import { useStep } from '../context/steps';
import { Alert, Button, Tag } from 'antd';
import useFilters from '../hooks/useFilters';
import { FiltersOptions } from '../types';
import { useStorage } from '../context/storage';

export interface FiltersAsideProps extends WithTranslation, RouteComponentProps, CacheProps, IdentityProps, UserProfileProps {}

const FiltersAside: React.FC<FiltersAsideProps> = (props) => {
  const { t } = props;

  const { activeStep, handleSetStep } = useStep();
  const { filters, updateFilters } = useFilters();
  const { locations, sectors, typologies } = useStorage();

  const [tags, setTags] = React.useState<any[]>([]);

  const handleChangeFilters = (type: FiltersOptions, value: any) => {
    const filter = filters[type];
    const filterIndex = filter.findIndex((f) => {
      if (type === 'countries') {
        return f.code === value.code;
      }
      return f.id === value.id;
    });
    if (filterIndex === -1) {
      updateFilters({
        [type]: [...filter, value],
      });
    } else {
      updateFilters({
        [type]: filter.filter((f) => f.id !== value.id),
      });
    }
  };

  React.useEffect(() => {
    switch (activeStep.type) {
      case 'sectors':
        setTags(sectors);
        break;
      case 'typologies':
        setTags(typologies);
        break;
      case 'locations':
        setTags(locations);
        break;
      default:
        setTags([]);
        break;
    }
  }, [activeStep, locations, sectors, typologies]);

  React.useEffect(() => {
    console.log('filters', filters);
  }, [filters]);

  return (
    <aside
      className="filters"
      style={{
        width: activeStep.step === 3 ? 0 : 316,
        visibility: activeStep.step === 3 ? 'hidden' : 'visible',
        opacity: activeStep.step === 3 ? 0 : 1,
      }}
    >
      <div className="description">
        <Alert message={t(activeStep.description)} type="info" />
      </div>
      <div className="tags">
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            color={filters[activeStep.type as FiltersOptions].find((f) => f.id === tag.id) ? 'blue' : 'default'}
            onClick={() => handleChangeFilters(activeStep.type as FiltersOptions, tag)}
            style={{ cursor: 'pointer' }}
          >
            {t(tag.name)}
          </Tag>
        ))}
      </div>
      <div className="actions">
        <Button block disabled={activeStep.previous === null} onClick={() => handleSetStep(activeStep.previous)}>
          {t('Back')}
        </Button>
        <Button block disabled={activeStep.next === null} onClick={() => handleSetStep(activeStep.next)} type="primary">
          {t('Continue')}
        </Button>
      </div>
    </aside>
  );
};

export default withIdentity(withUserProfile(withCache(withTranslation()(withRouter(FiltersAside)))));
