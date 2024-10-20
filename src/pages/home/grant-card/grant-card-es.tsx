import {
  LockOutlined,
  UnlockOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  TagOutlined,
  FolderOutlined,
  FormOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Spin, Tag, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { container } from 'src/inversify.config'
import { GrantBriefSummary } from 'src/stores/grant-store'
import HttpService from '../../../core/services/http.service'
import { ShowCountryFlag } from '../../../components/flags-icons'
import { IdentityProps, withIdentity } from '../../../core/services/authentication'
import calendariCon from 'src/assets/blue-icons-set_1-27.png'
import { UserProfileProps, UserProfile, withUserProfile } from 'src/components/user-profile'
import useWindowSize from 'src/utils/hooks/useWindowSize'
import { convertNewDate, cutNumber } from 'src/utils/helpers'
import FavoriteComponent from 'src/components/favorite-component'
import TypoologyTag from 'src/components/Typology-Tag'
import FileSaver from 'file-saver'

interface GrantCardEsProps extends WithTranslation, RouteComponentProps, IdentityProps, UserProfileProps {
  item: GrantBriefSummary
  userProfile: UserProfile
  height?: number 
}

const GrantCardEs: FC<GrantCardEsProps> = ({ t, item, userProfile, identity, height }) => {
  const sz = useWindowSize()
  const httpService = container.get(HttpService)
  const [favorite, setFavorite] = useState<boolean>(item?.isFavorite ?? false)
  const [countries] = useState(userProfile.countries)
  const [pptLoading, setPptLoading] = useState(false)

  useEffect(() => {
    setFavorite(item.isFavorite ?? false)
  }, [item]) // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = (identity.roles ? identity.roles : [])
    .filter(o =>
      o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant'))?.length > 0

  const onlyCountryViewer = (identity.roles ? identity.roles : [])
    .some(r => /country.*viewer$/i.test(r.toLowerCase())) && !isAdmin;

  const SetFavorite = async () => {
    const result = await httpService.post(`api/v1/grants/favorite/` + item.id, {
      isFavorite: !favorite,
    })
    if (result) setFavorite(!favorite)
  }

  const getBeneficiaryTypeNameById = (id: string) => {
    const beneficiaryTypes = userProfile.beneficiaryTypes.filter(a => a.id === id)
    return beneficiaryTypes[0]?.name
  }

  const getAnnuityById = (id: string) => {
    const annuities = userProfile.annuities.filter(a => a.id === id)
    return annuities[0]?.name

  }
  const getSectorsNameById = (id: string) => {
    const sectors = userProfile.sectors.filter(a => a.id === id)
    return sectors[0]?.name
  }

  const getTypologiesNameById = (id: string) => {
    const typologies = userProfile.typologies.filter(a => a.id === id)
    return typologies[0]?.name
  }

  const getLocationsNameById = (id: string) => {
    const locations = userProfile.locations.filter(a => a.id === id)
    return locations[0]?.name
  }

  const handleDownloadPowerPoint = async (grantId: number) => {
    setPptLoading(true)
    const result = await httpService.get(`api/v1/grants/grantSlide/${grantId}`, {
      responseType: 'arraybuffer'
    })
      const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
      (FileSaver as any).saveAs(blob, `${item.title}.pptx`)
    setPptLoading(false)
  }

  return (
    <Card style={{height: height, margin:'auto'}}
      loading={pptLoading}
      className={'grant-item-container'}
      extra={<>
        <Tooltip title={t('Download ID Card')}>
          {' '}
          {!onlyCountryViewer&&
            <Spin spinning={pptLoading}>
              <VerticalAlignBottomOutlined
                onClick={() => handleDownloadPowerPoint(Number(item.id))}
                style={{ fontSize: '20px', cursor: 'pointer', marginRight: 15}}
              />
            </Spin>
          }
        </Tooltip>
        <FavoriteComponent SetFavorite={SetFavorite} countryId={item.countryId} favorite={favorite} externalSystem={item.externalSystem} />
      </>}
      title={
        <Link to={`/search/${item.id}`}>
          {item.status == 'Closed' && (
            <Tooltip title={t('Closed')}>
              <Tag color="red">
                <LockOutlined />
                {t('Closed')}
              </Tag>
            </Tooltip>
          )}
          {item.status == 'Open' && (
            <Tooltip title={t('Open')}>
              <Tag color="green">
                <UnlockOutlined />
                {t('Open')}
              </Tag>
            </Tooltip>
          )}
          {item.status == 'PendingPublication' && (
            <Tooltip title={t('Pending')}>
              <Tag color="warning">
                <FormOutlined />
                {t('Pending')}
              </Tag>
            </Tooltip>
          )}
          <Tooltip title={item.title}>{item.title.slice(0, cutNumber(1, sz)) + (item.title.length > cutNumber(1, sz) ? '...' : '')}</Tooltip>
        </Link>
      }
    >

      <Tooltip style={{ marginTop: -15 }} title={item.scope}>
        {item.scope ? (item.scope?.replace('\n', '').slice(0, cutNumber(1, sz)) + (item.scope?.length > cutNumber(1, sz) ? '( ... ) ' : '')) : '' }
      </Tooltip>


      <Row className="row-calendar">
        <img src={calendariCon} />
        <Tooltip title={t('Annuities')}>
          {item.annuities.map((x) => (
            <Tag color="red" style={{ marginRight: 8 }}>
              {t(getAnnuityById(x))}
            </Tag>
          ))}
        </Tooltip>
        <span>{ShowCountryFlag(item.countryId, countries)}</span>

        <Col>
          {item.periods && item.periods.length > 0 ?
            <Tooltip title={t('Closing Date')}>
              {item.periods.map((period) => (
                period.closingDate ?
                  <Tag color="volcano" style={{ marginRight: '5px' }}>
                    <LockOutlined style={{ marginRight: '5px' }} />
                    {convertNewDate(period.closingDate)}
                  </Tag>
                  :
                  <Tag color="volcano"><LockOutlined /> {t('Closing Date Undefined')}</Tag>
              ))}
            </Tooltip>
            : <Tag color="volcano"><LockOutlined /> {t('Closing Date Undefined')}</Tag>
          }
        </Col>

        <Col>
          {item.locations && item.locations.length > 0 ?
            <Tooltip title={t('Region')}>
              {item.locations.map((x) => (
                <Tag color="gold" style={{ marginRight: 8 }}>
                  <EnvironmentOutlined style={{ marginRight: '5px' }} />
                  {t(getLocationsNameById(x))}
                </Tag>
              ))}
            </Tooltip>
            : <Tag color="gold"><EnvironmentOutlined /> {t('Region Undefined')}</Tag>
          }
        </Col>

      </Row>

      <Row style={{ marginBottom: 10 }}>
        {
          (item.beneficiaryTypesId && item.beneficiaryTypesId.length > 0) ?
            <Tooltip title={t('Beneficiary Types')}>
              {item.beneficiaryTypesId.map((x) => (
                <Tag color="blue">
                  <TeamOutlined />
                  {t(getBeneficiaryTypeNameById(x))}
                </Tag>
              ))}
            </Tooltip>
            : <Tag color="blue"><TeamOutlined /> {t('Beneficiary Types Undefined')}</Tag>
        }
      </Row>
          <Row style={{ marginBottom: 10 }}>
              {item.typologies && item.typologies.length > 0 ? (
                  item.typologies.map((x) => (
                      <TypoologyTag key={x} typologyName={(getTypologiesNameById(x))} />)
                  ))
               : (
                  <Tag color="purple"><TagOutlined /> {t('Typologies Undefined')}
                  </Tag>
              )}
          </Row>

      <Row>
        {item.sectors && item.sectors.length > 0 ?
          <Tooltip title={t('Sectors')}>
            {item.sectors.map((x) => (
              <Tag color="cyan">
                <FolderOutlined />
                {t(getSectorsNameById(x))}
              </Tag>
            ))}
          </Tooltip>
          : <Tag color="cyan"> <FolderOutlined /> {t('Sectors Undefined')}</Tag>
        }
      </Row>
    </Card>
  )
}

export default withUserProfile(withIdentity(withTranslation()(withRouter(GrantCardEs))))
