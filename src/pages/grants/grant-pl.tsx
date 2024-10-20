import { FileOutlined } from '@ant-design/icons'
import { Card, Col, Row, Alert, Tag } from 'antd'
import { FC, useState } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { container } from 'src/inversify.config'
import { GrantItem, GrantFile, GrantFileSummary } from 'src/stores/grant-store'
import { GetImageFlag } from '../../components/flags-icons'
import { formatCurrency } from '../../core/utils/object'
import HttpService from '../../core/services/http.service'
import { IdentityProps, withIdentity } from '../../core/services/authentication'
import FileSaver from 'file-saver'
import { defineCategory } from 'src/utils/helpers'
import FileGeneralDetail from 'src/pages/grants/file-general';

interface GrantPlDetailProps extends WithTranslation, RouteComponentProps, IdentityProps {
  grant: GrantItem
  fileKeys: string[]
}

const GrantPlDetail: FC<GrantPlDetailProps> = (props) => {
  const { t, grant, fileKeys } = props
  const httpService = container.get(HttpService)
  const [pptLoading, setPptLoading] = useState(false)
  const isAdmin =
    (props.identity.roles ? props.identity.roles : []).filter((o) => o.includes('Administrator') || o.includes('Manager') || o.includes('Consultor'))
      .length > 0

  const onDownloadRequested = async (grantFile: GrantFile) => {
    const result = await httpService.get(`api/v1/grantFiles/download/` + grantFile.id, {
      responseType: 'arraybuffer',
    })
    const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
    (FileSaver as any).saveAs(blob, `${grantFile.fileName}`)
  }

  //var TypeList = () => {
  //  return files?.items.map((t) => t.documentType)
  //    .distinct((t) => t)
  //    .toArray()
  //}

  //-handle Create PPT
  const handleDownloadPowerPoint = async ({
    title,
    country,
    beneficiaryTypes,
    locations: _locations,
    deadline,
    grantBudget,
    minimis,
    minBudget,
    maxBudget,
    grantBody
  }: GrantItem) => {

    setPptLoading(true)

    let beneficiaries = beneficiaryTypes ? beneficiaryTypes.map(i => i.name) : ""
    let locations = _locations ? _locations?.map(i => i.name) : ""
    let grantIntensity = grantBody ? grantBody.IntensidadAyuda : ""
    let financingModality = grantBody ? grantBody.ModalidadFinanciacion : ""
    let modeParticipation = grantBody ? grantBody.ModalidadParticipacion : ""
    let organism = grantBody ? grantBody.Organismo : ""

    let obj = {
      title,
      organism,
      modeParticipation,
      minimis,
      beneficiaries: beneficiaries.toString().replaceAll(',', ', '),
      financingModality,
      grantIntensity,
      grantBudget: grantBudget === 0 ? "" : formatCurrency(1 * grantBudget),
      minBudget: minBudget === 0 ? "" : formatCurrency(1 * minBudget),
      maxBudget: maxBudget === 0 ? "" : formatCurrency(1 * maxBudget),
      deadline,
      country,
      locations: locations.toString().replaceAll(',', ', ')
    }

    const result = await httpService.get(`api/v1/grants/grantSlide/${grant.id}`, {
      responseType: 'arraybuffer'
    })

      const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
      (FileSaver as any).saveAs(blob, `${grant.title}.pptx`)


    setTimeout(() => {
      setPptLoading(false)
    }, 3000)
  }

  return (
    <>
      {grant &&
        <Row className="grants-container">
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

              {grant.deadline &&
                <Col span={8}>
                  <span> <i className="fa-solid fa-bullseye"></i> {t('Deadline')} </span>
                  <span> {grant.deadline} </span>
                </Col>}


              {grant.url &&
                <Col span={6}>
                  <span> <i className="fa-solid fa-link"></i> {t('Url')}</span>
                  <a target="_blank" href={grant.url}> {t('Click Here!')} </a>
                </Col>}

              {grant.description &&
                <Col span={24}>
                  <span> <i className="fa-solid fa-circle-info"></i> {t('Description')} </span>
                  <span> {grant.description} </span>
                </Col>}
            </Row>
          </Card>

          {/*DOCUMENTOS*/}
            {fileKeys.length > 0 && <Card title={t('Documents')} className="grant-card">
               <FileGeneralDetail key={grant.id} grantId={grant.id} fileKeys={fileKeys}/>
            </Card>}

          {/*{TypeList().length > 0 && (*/}
          {/*  <Card title={t('Files')} className="grant-card">*/}

          {/*    {TypeList().map((type) => (*/}
          {/*      <Row>*/}
          {/*        <Col span={24}>*/}
          {/*          <Alert message={type as string} type="info" />*/}
          {/*        </Col>*/}

          {/*        {files.items*/}
          {/*          .filter((doc) => doc.documentType == type)*/}
          {/*          .map((doc) => (*/}
          {/*            <Col span={24} style={{ paddingLeft: 50 }}>*/}
          {/*              {' '}*/}
          {/*              <a onClick={() => onDownloadRequested(doc)}>*/}
          {/*                <FileOutlined style={{ marginRight: 5 }} />*/}
          {/*                {doc.documentTitle}*/}
          {/*              </a>*/}
          {/*              {doc.documentDescription && <p> {doc.documentDescription}</p>}*/}
          {/*            </Col>*/}
          {/*          ))}*/}
          {/*      </Row>*/}
          {/*    ))}*/}
          {/*  </Card>*/}
          {/*)}*/}
        </Row>
      }
    </>
  )
}

export default withIdentity(withTranslation()(withRouter(GrantPlDetail)))
