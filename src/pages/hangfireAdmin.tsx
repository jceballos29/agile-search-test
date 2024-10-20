import Icon, {
  CalendarOutlined,
  ClearOutlined,
  CloudDownloadOutlined,
  EnvironmentOutlined,
  LockOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Pagination, Row, Spin, Tag, Tooltip, Input, Alert, Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import ContentHeader from 'src/core/ui/content-header';
import { GrantFilters, BuildFilters } from 'src/components/grant-filters';
import AnnuitySelect from 'src/components/annuity-select';
import CountrySelect from 'src/components/country-select';
import LocationSelect from 'src/components/location-select';
import SectorSelect from 'src/components/sector-select';
import BeneficiaryTypeSelect from 'src/components/beneficiary-type-select';
import FormItem from 'antd/lib/form/FormItem';
import { container } from 'src/inversify.config';
import { Query } from 'src/core/stores/data-store';
import { GrantFile, GrantStatus, GrantSummaryStore } from 'src/stores/grant-store';
import { GetFlag, GetImageFlag } from '../../components/flags-icons';
import debounce from 'lodash/debounce';
import { useHistory } from 'react-router-dom';
import HttpService from '../core/services/http.service';
const { Search } = Input;
const { Option } = Select;

interface HangfireAdminProps extends WithTranslation, RouteComponentProps {}

const HangfireAdmin: FC<HangfireAdminProps> = (props) => {
  const history = useHistory();

  useEffect(() => {
    history.push({ pathname: 'hangfire', search: 'access_token=' + HttpService.accessToken });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div></div>;
};

export default withTranslation()(withRouter(HangfireAdmin));
