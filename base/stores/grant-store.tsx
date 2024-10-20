import { Query, QueryResult } from 'src/core/stores/data-store'
import DataStore from 'src/core/stores/data-store'
import FormStore from 'src/core/stores/form-store'
import { interfaces } from 'inversify'
import moment, { Moment } from 'moment'
import { OfficialSourceEnum } from 'src/utils/enums/officialSource.enum'
import { Period } from 'src/pages/admin/publication-control/grants-edit/grant-edit'
import { FinancingModalityEnum } from 'src/utils/enums/financingModality.enum'

export enum GrantStatus {
  Closed = 'Closed',
  Open = 'Open',
  PendingPublication = 'PendingPublication',
}

export enum SourceType {
  Unknown,
  Private,
  Public,
  Both = Private | Public
}

export function SourceParse(strRole: string) {
  if (strRole == 'Both') return SourceType.Both
  if (strRole == 'Unknown') return SourceType.Unknown
  var result = SourceType.Unknown
  if (strRole == 'Private') result |= SourceType.Private
  if (strRole == 'Public') result |= SourceType.Public
  return result
}

export function hasSource(source: SourceType, toCheck: SourceType) {
  if (typeof source === 'string') {
    source = SourceParse(source)
  }
  const r = source as number
  const c = toCheck as number
  return (r & c) === c
}

export enum Category {
  A,
  B,
  C,
  D,
  E,
  Others
}

export enum PublicationType {
  Convocatoria,
  Modificacion,
  BasesReguladoras,
  Resolucion,
  Otro,
}

export interface baseDimensionSummary {
  id: string
  name: string
}

export interface baseDimensionitem {
  value: number
  label: string
}

export interface ContactEmail {
  countryId: string
  message: string
  grantName: string
  grantId: string
}

export interface GrantBase {
  id: string;
  title: string;
  description: string;
  countryId: string;
  status: GrantStatus;
  externalSystem?: string;
}

export interface GrantSummary extends GrantBase {
  openningDate: Date
  closingDate: Date
  category: string
  published: boolean
  deleted: boolean
  publicationDate: Date
  country: string
  modifiedOn: Date
  createdOn: Date
  url: string
  grantBudget: number
  minBudget: number
  maxBudget: number
  warranties: boolean
  advance: boolean
  deadline: string
  locations: baseDimensionSummary[]
  annuities: baseDimensionSummary[]
  sectors: baseDimensionSummary[]
  targetsectors: baseDimensionSummary[]
  beneficiaryTypes: baseDimensionSummary[]
  typologies: baseDimensionSummary[]
  resume: GrantFile
  interest: boolean
  summary: boolean
  isFavorite: boolean
  countryIcon: string
  minimis: boolean
  grantBody: any
  modalityParticipation: string
  grantIntensity: string
  additionalInformation: string
  organism: string
  financingModality: string
  scope: string
  beneficiarySource: SourceType
  source: SourceType
  webPublished: boolean
  conNewsLetter: boolean
  periods: Period[]
  financingModalityValue: FinancingModalityEnum
  publicationType: PublicationType
  isUserCustomized: boolean
  modifiedBy: string
  createdByDisplayName: string
  organismUrl: string


}

export interface GrantBriefSummary extends GrantBase {
  published: boolean;
  isFavorite: boolean;
  beneficiaryTypesId: string[];
  sectors: string[];
  targetsectors: string[];
  typologies: string[];
  locations: string[];
  annuities: string[];
  publicationDate?: Date;
  periods?: Period[];
  category: string;
  modalityParticipation: string;
  financingModality: string[];
  financingModalityValue: string;
  scope: string;
}

export interface GrantFeaturedSummary extends GrantBase {
  deadline: string;
  annuities: string[]
}

export interface GrantTopSummary extends GrantBase { annuities: string[] }

export interface GrantFile {
  id: string
  fileName: string
  documentType: string
  documentDescription: string
  documentTitle: string
  url: string
}

export interface GrantItem {
    id: string
    title: string
    annuities: baseDimensionSummary[]
    published: boolean
    publicationDate: Date
    countryId: string
    country: string
    url: string
    beneficiarySource: SourceType
    source: SourceType
    modifiedById: string
    modifiedByDisplayName: string
    category: Category
    interest: boolean
    summary: boolean
    externalSystem: string
    fiSuccessRate: number
    observations: string
    webPublished: boolean
    conNewsLetter: boolean
    publicationType: PublicationType
    publicationTypeText: string
    status: GrantStatus
    description: string
    grantBudget: number
    deadline: string
    locations: baseDimensionSummary[]
    beneficiaryTypes: baseDimensionSummary[]
    sectors: baseDimensionSummary[]
    targetSectors: baseDimensionSummary[]
    typologies: baseDimensionSummary[]
    keywords: baseDimensionSummary[]
    grantBody: any
    minimis: boolean
    totalBudget: number
    projectGroup: string
    files: GrantFile[]
    isFavorite: boolean
    translations: { [key: string]: string }
    openningDateShow: Moment
    closingDateShow: Moment
    publicationDateShow: Moment
    countryIcon: string
    deadlineString: Date
    sectorsShow: any
    targetSectorsShow: any
    typologiesShow: any
    locationsShow: any
    beneficiaryTypesShow: any
    annuityShow: any
    maxBudget: number
    minBudget: number
    warranties: boolean
    advance: boolean
    modalityParticipation: string
    organism: string
    financingModality: string
    grantIntensity: string
    scope: string
    aidIntensity: string
    additionalInformation: string
    publicBodyContactPhone: string
    publicBodyContactEmail: string
    oficialSource: OfficialSourceEnum
    successRate: string
    periods: Period[]
    codesBDNS: string[]
    financingModalityValue: FinancingModalityEnum
    organismUrl: string
    hat: boolean
    contactHat: string
    contactHat2: string
    mirror1: string
    mirror2: string
    mirror3: string
    mirror4: string
}

export class GrantSummaryStore extends DataStore<GrantSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grants`
  }
}

export class GrantBriefSummaryStore extends DataStore<GrantBriefSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/grants/search`;
  }
}

export class ConfigurationGrantSummaryStore extends DataStore<GrantSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grants`
  }
}
export class GrantHistorySummaryStore extends DataStore<GrantSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grants/history`
  }
}

export class TopGrantSummaryStore extends DataStore<GrantTopSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grants/top`
  }
}

export class FeaturedGrantSummaryStore extends DataStore<GrantFeaturedSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grants/featured`
  }
}

export class GrantItemStore extends FormStore<GrantItem, GrantItem> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`)
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grants`
  }

  public async load(id: string) {
    return this.handleCallAsync(async () => {
      const response = await this.httpService.get<GrantItem>(`${this.baseUrl}/${encodeURIComponent(id)}?noIncludeFiles=true`)
      this._state.set((s) => {
        s.item = response.data
        return s
      })
      return response.data
    })
  }
}

export interface GrantFileSummary {
  count: number
  items: GrantFile[]
}

export class FileGrantSummaryStore extends DataStore<GrantFile> {
  private publicUrl: string
  public activeKey: string | undefined

  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grantfiles`
    this.activeKey = undefined
  }

  public async getAll(id: number, query: Query, activeKey: string) {
    this.activeKey = activeKey;

    return this.handleCallAsync(async () => {
      const response = await this.httpService.get<GrantFileSummary>(`${this.baseUrl}/grant/${id}?${DataStore.buildUrl(query as Query)}`)
      this._state.set((s) => {
        s.count = response.data.count
        s.items = response.data.items
        return s
      })
      return response.data
    })
  }
}

export class FileAttachmentGrantSummaryStore extends DataStore<GrantFile> {
  private publicUrl: string

  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grantfiles`
  }

  public async getAll(id: number, query: Query) {
    return this.handleCallAsync(async () => {
      const response = await this.httpService.get<GrantFileSummary>(`${this.baseUrl}/grant/${id}?${DataStore.buildUrl(query as Query)}`)
      this._state.set((s) => {
        s.count = response.data.count
        s.items = response.data.items
        return s
      })
      return response.data
    })
  }
}

export class FileTypeGrantSummaryStore extends DataStore<string> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/grantfiles`
  }

  public async getAll(id: number) {
    return this.handleCallAsync(async () => {
      const response = await this.httpService.get<QueryResult<string>>(`${this.baseUrl}/types/grant/${id}`)
      this._state.set((s) => {
        s.count = response.data.count
        s.items = response.data.items
        return s
      })
      return response.data
    })
  }
}