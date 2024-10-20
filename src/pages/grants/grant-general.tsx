import { Card, Col, Row, Tag } from 'antd'
import { FC } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { GrantItem } from 'src/stores/grant-store'
import { GetImageFlag } from '../../components/flags-icons'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import { UserProfileProps, withUserProfile } from '../../components/user-profile'
import './grant-details.less'
import FileGeneralDetail from 'src/pages/grants/file-general';
import { convertNewDate, defineCategory, defineParticipation, getTranslations } from 'src/utils/helpers'

interface GrantGeneralDetailProps extends WithTranslation, RouteComponentProps, IdentityProps, UserProfileProps {
  grant: GrantItem
  fileKeys: string[]
}

const GrantGeneralDetail: FC<GrantGeneralDetailProps> = (props) => {
  const { t, grant, fileKeys } = props

  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter(
      (o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor') || o.includes('Consultant')
    )?.length > 0

    const getCountryCurrencyById = (code: string): string => {
        const country = props.userProfile.countries.filter(a => a.code === code);
        return country[0]?.currency.toString() || '';
    }

    const formatterBudget = (value, currency) => {
        if (!value) return '';
        const valueStr = String(value);
        const parts = valueStr.split('.');
        const formattedIntegerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        let formattedValue = `${formattedIntegerPart}${parts.length > 1 ? `.${parts[1]}` : ''}`;

        if (currency == "R$" || currency == "¥" || currency == "£") {
            formattedValue = currency + " " + formattedValue;  
        } else {
            formattedValue = formattedValue + " " + currency; 
        }
        return formattedValue;
    };

  return (
    <>
      {grant &&
        <Row className="grants-container">

          {/*SUMMARY*/}
          <Card title={t('Summary')} className="grant-card">

            <Row gutter={[16, 16]}>

              {grant.country &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-flag"></i> {t('Country')} </span>
                  <span className='flag'> {GetImageFlag(grant.countryId, grant.countryIcon)} </span>
                </Col>}


              {grant.annuities &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Annuity')} </span>
                  <span> {grant.annuities.map(x => <Tag>{x.name}</Tag>)} </span>
                </Col>}


              {grant.status &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-face-smile"></i> {t('Status')} </span>
                  <span> {t(grant.status)} </span>
                </Col>}


              {grant.category &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-bookmark"></i> {t('Category')} </span>
                  <span> {t(defineCategory(grant.category))} </span>
                </Col>}


              {grant.scope &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-bullseye"></i> {t('Scope')} </span>
                  <span> {grant.scope} </span>
                </Col>}


              {grant.financingModalityValue &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-credit-card-alt"></i> {t('Financing Modality')} </span>
                  <span> {grant.financingModalityValue.toString() === 'PartiallyRefundable' ?
                    t("Partially Reimbursable") :
                    t(grant.financingModalityValue.toString())}
                  </span>
                </Col>}


              {grant.aidIntensity &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-sack-dollar"></i> {t('Intensity')} </span>
                  <span> {getTranslations(grant, 'intensidadAyuda', grant.aidIntensity)} </span>
                </Col>}


              {grant.url &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-link"></i> {t('Url')}</span>
                  <a target="_blank" href={grant.url}> {t('Click Here!')} </a>
                </Col>}


              {grant.locations.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-thumbtack"></i>{t('Region')}</span>
                  <Row>
                    {grant.locations?.map((x) => (
                      <Tag key={x.name}>{t(x.name)}</Tag>
                    ))}
                  </Row>
                </Col>}


              {grant.modalityParticipation &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-handshake"></i> {t('Mode of Participation')} </span>
                  <span> {t(defineParticipation(grant.modalityParticipation))} </span>
                </Col>}


              {<Col span={6}>
                  <span> <i className="fa-solid fa-minimize"></i> {t('Minimis')} </span>
                  <span> {grant.minimis ? t('Yes') : t('Not')} </span>
                </Col>}


              {grant.grantBody?.CNAE && grant.grantBody?.CNAE?.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-circle-info"></i> {t('CNAE')} </span>
                  <span> {grant.grantBody?.CNAE?.map((t: any) => t.Label).join(', ')} </span>
                </Col>}


              {grant.grantBody?.TasaExitoConvocatoria &&
                <Col span={6}>
                  <span>  <i className="fa-solid fa-circle-info"></i> {t('Call Success Rate')}</span>
                  <span> {grant.grantBody?.TasaExitoConvocatoria} </span>
                </Col>}


              {grant.description &&
                <Col span={24}>
                  <span> <i className="fa-solid fa-circle-info"></i> {t('Description')} </span>
                  <span> {grant.description} </span>
                </Col>}

              {grant.additionalInformation &&
                <Col span={24}>
                  <span> <i className="fa-solid fa-circle-info"></i> {t('Additional Information')} </span>
                  <span> {grant.additionalInformation} </span>
                </Col>}

            </Row>
          </Card>


          {/*ADITIONAL INFO*/}
          <Card title={t('Additional information')} className="grant-card" >
            <Row gutter={[16, 16]}>

              {grant.sectors.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-tag"></i> {t('Sectors')} </span>
                  <Row>
                    {grant.sectors?.map((x) => (
                      <Tag key={x.name}>{t(x.name)}</Tag>
                    ))}
                  </Row>
                </Col>}

                {grant.targetSectors.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-tag"></i> {t('Target Sectors')} </span>
                  <Row>
                    {grant.targetSectors?.map((x) => (
                      <Tag key={x.name}>{t(x.name)}</Tag>
                    ))}
                  </Row>
                </Col>}


              {grant.typologies.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-folder-open"></i> {t('Typologies')} </span>
                  <Row>
                    {grant.typologies?.map((x) => (
                      <Tag key={x.name}>{t(x.name)}</Tag>
                    ))}
                  </Row>
                </Col>}


              {grant.organism &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-circle-info"></i> {t('Organism')} </span>
                  <span> {grant.organism} </span>
                  {grant.organismUrl &&
                    <>
                      <span> <i className="fa-solid fa-link"></i></span>
                      <a target="_blank" href={grant.organismUrl}> {t('Click Here!')} </a>
                    </>
                  }
              </Col>}

              {grant.beneficiaryTypes.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-user"></i> {t('Beneficiary Types')} </span>
                  <Row>
                    {grant.beneficiaryTypes?.map((x) => (
                      <Tag key={x.name}>{t(x.name)}</Tag>
                    ))}
                  </Row>
                </Col>}


              {grant.beneficiarySource &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-user-group"></i> {t('Beneficiary Source')} </span>
                  {grant.beneficiarySource.toString() == 'Both' ?
                    <span> {t("Private") + "," + t("Public")} </span> :
                    <span> {t(grant.beneficiarySource.toString())} </span>
                  }
                </Col>}


              {grant.oficialSource &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-circle-info"></i> {t('Official Source')} </span>
                  <span> {t(grant.oficialSource.toString())} </span>
                </Col>}


              {grant.source &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-database"></i> {t('Source of the founds')} </span>
                  {grant.source.toString() == 'Both' ?
                    <span> {t("Private") + "," + t("Public")} </span> :
                    <span> {t(grant.source.toString())} </span>
                  }
                </Col>}


              {grant.grantBody?.EtiquetasTecnologicas && grant.grantBody?.EtiquetasTecnologicas.length > 0 &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-microchip"></i> {t('Tech Labels')} </span>
                  <span> {grant.grantBody.EtiquetasTecnologicas.map((t: any) => t.Label).join(', ')} </span>
                </Col>}


              <Col span={6}>
                <span> <i className="fa-solid fa-check-to-slot"></i> {t('Warranties')} </span>
                <span> {grant.warranties ? t('Yes') : t('Not')} </span>
              </Col>


              <Col span={6}>
                <span> <i className="fa-solid fa-file-contract"></i> {t('Advance')} </span>
                <span> {grant.advance ? t('Yes') : t('Not')} </span>
              </Col>


              {/*{grant.grantBody?.InformacionConvocatoria &&*/}
              {/*  <Col span={12}>*/}
              {/*    <span> <i className="fa-solid fa-phone"></i> {t('Call Information')} </span>*/}
              {/*    <span> {getTranslations(grant, 'informacionConvocatoria', grant.grantBody?.InformacionConvocatoria)} </span>*/}
              {/*  </Col>}*/}
              <Col span={12}>
                <span> <i className="fa-solid fa-phone"></i> {t('Public Body Contact Phone')} </span>
                <span> {grant.publicBodyContactPhone ? grant.publicBodyContactPhone : t('Undefined')} </span>
              </Col>


              <Col span={12}>
                <span> <i className="fa-sharp fa-solid fa-envelope"></i> {t('Public Body Contact Email')} </span>
                <span> {grant.publicBodyContactEmail ? grant.publicBodyContactEmail : t('Undefined')} </span>
              </Col>


              {grant.grantBody?.Instrumento &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-toolbox"></i> {t('Instrument')} </span>
                  <span> {t(grant.grantBody?.Instrumento?.Label)} </span>
                </Col>}


              {grant.grantBody?.TRL &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-weight-scale"></i> {t('TRL')} </span>
                  <span> {grant.grantBody?.TRL} </span>
                </Col>}


              {grant.observations &&
                <Col span={24}>
                  <span> <i className="fa-solid fa-eye"></i> {t('Observations')} </span>
                  <span> {grant.observations} </span>
                </Col>}

            </Row>
          </Card>


          {/*CALL DATES*/}
          <Card title={t('Call Dates')} className="grant-card" >
            <Row gutter={[16, 16]}>

              {grant.publicationDate &&
                <Col span={8}>
                  <span> <i className="fa-sharp fa-solid fa-circle-exclamation"></i> {t('Publication Date')} </span>
                  <span> {convertNewDate(grant.publicationDate)} </span>
                </Col>}


              {grant.periods.length > 0 &&
                <Col span={16}>
                  {grant.periods.map((period) => (
                    <Row key={period.id}>
                      <Col span={12}>
                        <span> <i style={{ color: 'green' }} className="fa-solid fa-circle"></i> {t('Opening Date')} </span>
                        <span> {convertNewDate(period.openningDate)} </span>
                      </Col>
                      <Col span={11}>
                        <span> <i style={{ color: 'red' }} className="fa-solid fa-circle"></i> {t('Closing Date')} </span>
                        <span> {convertNewDate(period.closingDate)} </span>
                      </Col>
                    </Row>
                  ))}
                </Col>}


              {grant.deadline &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-bullseye"></i> {t('Deadline')} </span>
                  <span> {grant.deadline} </span>
                </Col>}


              {grant.grantBody?.Modificaciones1 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Modification') + ' 1'} </span>
                  <span> {getTranslations(grant, 'modificaciones1', grant.grantBody?.Modificaciones1)} </span>
                </Col>}
              {grant.grantBody?.Modificaciones2 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Modification') + ' 2'} </span>
                  <span> {getTranslations(grant, 'modificaciones2', grant.grantBody?.Modificaciones2)} </span>
                </Col>}
              {grant.grantBody?.Modificaciones3 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Modification') + ' 3'} </span>
                  <span> {getTranslations(grant, 'modificaciones3', grant.grantBody?.Modificaciones3)} </span>
                </Col>}
              {grant.grantBody?.Modificaciones4 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Modification') + ' 4'} </span>
                  <span> {getTranslations(grant, 'modificaciones4', grant.grantBody?.Modificaciones4)} </span>
                </Col>}
              {grant.grantBody?.Modificaciones5 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Modification') + ' 5'} </span>
                  <span> {getTranslations(grant, 'modificaciones5', grant.grantBody?.Modificaciones5)} </span>
                </Col>}


              {grant.grantBody?.Resoluciones1 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Resolution') + ' 1'} </span>
                  <span> {getTranslations(grant, 'resoluciones1', grant.grantBody?.Resoluciones1)} </span>
                </Col>}
              {grant.grantBody?.Resoluciones2 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Resolution') + ' 2'} </span>
                  <span> {getTranslations(grant, 'resoluciones2', grant.grantBody?.Resoluciones2)} </span>
                </Col>}
              {grant.grantBody?.Resoluciones3 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Resolution') + ' 3'} </span>
                  <span> {getTranslations(grant, 'resoluciones3', grant.grantBody?.Resoluciones3)} </span>
                </Col>}
              {grant.grantBody?.Resoluciones4 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Resolution') + ' 4'} </span>
                  <span> {getTranslations(grant, 'resoluciones4', grant.grantBody?.Resoluciones4)} </span>
                </Col>}
              {grant.grantBody?.Resoluciones5 &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-calendar-days"></i> {t('Resolution') + ' 5'} </span>
                  <span> {getTranslations(grant, 'resoluciones5', grant.grantBody?.Resoluciones5)} </span>
                </Col>}

            </Row>
          </Card >


          {/*CALL BUDGET*/}
          <Card title={t('Call Budget')} className="grant-card" >
            <Row gutter={[16, 16]}>

              <Col span={8}>
                <span> <i className="fa-solid fa-money-bill-1-wave"></i>{t('Total Budget')} </span>
                <span>{grant.totalBudget ? formatterBudget(grant.totalBudget, t(getCountryCurrencyById(grant.countryId))) : t('Undefined')}</span>
              </Col>


              <Col span={8}>
                <span> <i className="fa-solid fa-money-check-dollar"></i>{t('Budget of the Grant')} </span>
                <span>{grant.grantBudget ? formatterBudget(grant.grantBudget, t(getCountryCurrencyById(grant.countryId))) : t('Undefined')}</span>
              </Col>


              <Col span={8}>
                <span> <i className="fa-solid fa-sack-dollar"></i> {t('Max Budget')} </span>
                <span>{grant.maxBudget ? formatterBudget(grant.maxBudget, t(getCountryCurrencyById(grant.countryId))) : t('Undefined')}</span>
              </Col>


              <Col span={8}>
                <span> <i className="fa-solid fa-coins"></i> {t('Min Budget')} </span>
               <span>{grant.minBudget ? formatterBudget(grant.minBudget, t(getCountryCurrencyById(grant.countryId))) : t('Undefined')}</span>
              </Col>


              {/*{grant.fiSuccessRate &&*/}
              {/*  <Col span={8}>*/}
              {/*    <span> <i className="fa-solid fa-circle-info"></i> {t('FI Success Rate')}</span>*/}
              {/*    <span> {grant.fiSuccessRate}% </span>*/}
              {/*  </Col>*/}
              {/*}*/}


              {/*{grant.successRate &&*/}
              {/*  <Col span={8}>*/}
              {/*    <span> <i className="fa-solid fa-circle-info"></i> {t('Success Rate')} </span>*/}
              {/*    <span> {grant.successRate} </span>*/}
              {/*  </Col>*/}
              {/*}*/}

              {isAdmin &&
               <Col span={8}>
                 <span> <i className="fa-solid fa-barcode"></i>{t('Projects Group')}</span>
                 <span>{grant.projectGroup ? grant.projectGroup : t('Undefined')}</span>
               </Col>}
               </Row>
          </Card >


          {/*DOCUMENTOS*/}
           { fileKeys.length > 0 && <Card title={t('Documents')} className="grant-card">
               <FileGeneralDetail key={grant.id} grantId={grant.id} fileKeys={fileKeys}/>
            </Card> }
        </Row >
      }
    </>
  )
}

export default withIdentity(withUserProfile((withTranslation()(withRouter(GrantGeneralDetail)))))
