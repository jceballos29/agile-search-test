import { LoadingOutlined } from '@ant-design/icons'
import { Avatar, Spin } from 'antd'
import React, { FC, useState, useMemo, ComponentType } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import HttpService from 'src/core/services/http.service'
import { container } from 'src/inversify.config'
import { withCache, CacheProps } from '../core/services/cache.service'
import logo from 'src/core/assets/logo.png'
import { CountrySummary } from '../stores/country-store'
import { BeneficiaryTypeSummary } from '../stores/beneficiary-type-store'
import { SectorSummary } from '../stores/sector-store'
import { AnnuitySummary } from '../stores/annuity-store'
import { CountrySummary as LocationSummary } from '../stores/location-store'
import { TypologySummary } from '../stores/typology-store'
import { ProjectGroupsSummary } from '../stores/projectGroups-store'
import { TargetSectorSummary } from '../stores/targetSector-store'

export interface UserProfile {
  adminAllowedCountries: string[],
  viewerAllowedCountries: string[],
  isAdmin: boolean,
  isFullAdmin: boolean,
  fullViewer: boolean,
  countries: CountrySummary[],
  beneficiaryTypes: BeneficiaryTypeSummary[],
  sectors: SectorSummary[]
  targetSectors: TargetSectorSummary[]
  annuities: AnnuitySummary[]
  locations: LocationSummary[]
  typologies: TypologySummary[]
  projectGroups: ProjectGroupsSummary[],
  areas: string[]
  minYear: number
  isAdminCountry : boolean,
  reload: () => void
}

const { Provider, Consumer } = React.createContext<UserProfile>(undefined as any)

export interface UserProfileSecureShellProps extends CacheProps, WithTranslation {
  serviceUrl: string
  loadingView?: JSX.Element
  errorView?: JSX.Element
}

const UserProfileSecureShell: FC<UserProfileSecureShellProps> = ({ serviceUrl, loadingView, errorView, cache, t, children }) => {
  const [status, setStatus] = useState<'LOADING' | 'OK' | 'ERROR'>('LOADING')

  const load = () => {
    httpService
      .get<UserProfile>(`${serviceUrl}/api/v1/cache/initialize`)
      .then((r) => {
        setUserProfile(
          {
            adminAllowedCountries: r.data.adminAllowedCountries,
            viewerAllowedCountries: r.data.viewerAllowedCountries,
            fullViewer: r.data.fullViewer,
            beneficiaryTypes: r.data.beneficiaryTypes,
            countries: r.data.countries,
            isAdmin: r.data.isAdmin,
            sectors: r.data.sectors,
            targetSectors: r.data.targetSectors,
            annuities: r.data.annuities,
            locations: r.data.locations,
            reload: () => load(),
            typologies: r.data.typologies,
            minYear: r.data.minYear,
            projectGroups: r.data.projectGroups,
            areas: r.data.areas,
            isFullAdmin: r.data.isFullAdmin,
            isAdminCountry: r.data.isAdminCountry,
          }
        )

      })
      .catch((reason: any) => {
      })

  }

  const [userProfile, setUserProfile] = useState<UserProfile>({
    viewerAllowedCountries: [],
    adminAllowedCountries: [],
    fullViewer: false,
    isAdmin: false,
    countries: [],
    beneficiaryTypes: [],
    sectors: [],
    targetSectors: [],
    annuities: [],
    locations: [],
    typologies: [],
    areas: [],
    projectGroups: [],
    reload: () => load(),
    minYear: 2000,
    isFullAdmin: true,
    isAdminCountry: false,
  })


  const httpService = container.get<HttpService>(HttpService)
  useMemo(() => {
    setStatus('LOADING')
    httpService
      .get<UserProfile>(`${serviceUrl}/api/v1/cache/initialize`)
      .then((r) => {

        setUserProfile(
          {
            adminAllowedCountries: r.data.adminAllowedCountries,
            viewerAllowedCountries: r.data.viewerAllowedCountries,
            fullViewer: r.data.fullViewer,
            beneficiaryTypes: r.data.beneficiaryTypes,
            countries: r.data.countries,
            isAdmin: r.data.isAdmin,
            sectors: r.data.sectors,
            targetSectors: r.data.targetSectors,
            annuities: r.data.annuities,
            locations: r.data.locations,
            reload: () => load(),
            typologies: r.data.typologies,
            minYear: r.data.minYear,
            projectGroups: r.data.projectGroups,
            areas: r.data.areas,
            isFullAdmin: r.data.isFullAdmin,
            isAdminCountry: r.data.isAdminCountry,
          }
        )
        if (!r.data || (!r.data.fullViewer && r.data.viewerAllowedCountries.length === 0)) {
          setStatus('ERROR')
        } else setStatus('OK')
      })
      .catch((reason: any) => {
        setStatus('ERROR')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'LOADING')
    return (
      loadingView || (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: '100px',
            marginTop: '-50px',
            marginLeft: '-200px',
            width: '400px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginLeft: '55px', marginBottom: '10px', display: 'flex' }}>
            <Spin style={{ marginRight: '10px', marginTop: '5px' }} indicator={<LoadingOutlined style={{ fontSize: 44 }} spin />} />{' '}
            <img style={{ marginTop: 12, background: 'rgb(0,0,164)', padding: '4px 4px 4px 4px' }} alt="fi-logo" src={logo} height={34} />
            <span style={{ fontSize: 18, float: 'right', marginTop: 12, marginLeft: 5, fontWeight: 'bold', color: '#0000a4' }}>
              Helping ideas grow
            </span>
          </div>

          <strong style={{ marginLeft: '10px', display: 'none' }}>{t('Loading Grants Searcher Application...')}</strong>
        </div>
      )
    )
  if (status === 'ERROR')
    return (
      errorView || (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: '100px',
            marginTop: '-50px',
            marginLeft: '-150px',
            width: '300px',
            textAlign: 'center',
          }}
        >
          <h1>{t('ERROR')}</h1>
          <p>{t("You don't have access to this application, please contact your Administrator...")}</p>
        </div>
      )
    )
  if (status === 'OK') {

    return <Provider value=
      {
        {
          fullViewer: userProfile.fullViewer,
          viewerAllowedCountries: userProfile.viewerAllowedCountries,
          adminAllowedCountries: userProfile.adminAllowedCountries,
          beneficiaryTypes: userProfile.beneficiaryTypes,
          countries: userProfile.countries,
          isAdmin: userProfile.isAdmin,
          sectors: userProfile.sectors,
          targetSectors: userProfile.targetSectors,
          annuities: userProfile.annuities,
          locations: userProfile.locations,
          reload: () => userProfile.reload(),
          typologies: userProfile.typologies,
          minYear: userProfile.minYear,
          projectGroups: userProfile.projectGroups,
          areas: userProfile.areas,
          isFullAdmin: userProfile.isFullAdmin,
          isAdminCountry: userProfile.isAdminCountry,
        }
      }>{children}</Provider>
  }
  return null
}

export interface UserProfileProps {
  userProfile: UserProfile
}

const withUserProfile = <T extends ComponentType<any>>(Component: T) => {
  return (props: any) => {
    return <Consumer>{(userProfile) => <Component {...props} userProfile={userProfile} />}</Consumer>
  }
}

export function checkCountry(profile: UserProfile, country: string) {
  return profile.fullViewer || profile.viewerAllowedCountries.filter((o) => o === country).length > 0
}

export default withCache(withTranslation()(UserProfileSecureShell))
export { withUserProfile }
