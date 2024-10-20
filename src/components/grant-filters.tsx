import { filter } from "lodash"

export interface GrantFilters {
  countryId?: string
  countries?: any
  annuities?: any[]
  published?: boolean
  deleted?: boolean
  sectors?: any[]
  typologies?: any[]
  locations?: any[]
  minimis?: number
  status?: any
  bftypes?: any[]
  sources?: number
  grantTypeInsert?: any
  category?: any
  interest?: number
  withDocuments?: number
  rangePublicationDate?: any[]
  rangeCreatedDate?: any[]
  targetSectors?: any[]
}

export function GetStatus(status: number) {
  if (status === 0) return 'Closed'
  if (status === 1) return 'PendingPublication'
  return 'Open'
}

export function GetGrantTypeInsert(grantTypeInsert: number) {
  if (grantTypeInsert === 1) return 'Manual'
  if (grantTypeInsert === 2) return 'SharePoint'
  if (grantTypeInsert === 3) return 'Externo'
  return 'Excel'
}

export function GetCategory(category: number) {
  if (category === 1) return 'A'
  if (category === 2) return 'B'
  if (category === 3) return 'C'
  if (category === 4) return 'D'
  if (category === 5) return 'E'
}


export function IsEmpty(filter: GrantFilters) {
  if (!filter) return false
  if (filter.annuities) return false
  if (filter.bftypes) return false
  if (filter.countryId) return false
  if (filter.locations) return false
  if (filter.minimis) return false
  if (filter.interest) return false
  return true
}

export function BuildHistoryFilters(pfilters: GrantFilters): any[] {
  let filters: any[] = []
  if (pfilters) {
    //country
    if (pfilters.countryId) {
      filters.push({
        grant: { countryId: { eq: pfilters.countryId } },
      })
    }
    //published
    if (typeof pfilters.published === 'boolean') {
      filters.push({
        grant: { published: { eq: pfilters.published } },
      })
    }

    //interest
    if (typeof pfilters.published === 'boolean') {
      filters.push({
        grant: { interest: { eq: pfilters.interest == 1 } },
      })
    }
    //annuity
    if (pfilters.annuities && pfilters.annuities.length > 0) {
      filters.push({
        or: pfilters.annuities.map((t) => ({ Annuities: { any: { AnnuityId: { eq: t.value } } } })),
      })
    }


    //locations
    if (pfilters.locations && pfilters.locations.length > 0) {
      filters.push({
        or: pfilters.locations.map((t) => ({ grant: { Locations: { any: { LocationId: { eq: t.value } } } } })),
      })
    }

    //minimis
    if (pfilters.minimis != undefined) {
      filters.push({
        grant: { minimis: { eq: pfilters.minimis == 1 } },
      })
    }

    //bfsources
    if (pfilters.sources != undefined) {
      filters.push({
        or: pfilters.sources == 1 ? [{ Source: { eq: 'Private' } }, { Source: { eq: 'Both' } }] : ['Public', 'Unknown', 'Both'].map((t) => ({ Source: { eq: t } })),
      })
    }

    //status
    if (pfilters.status && pfilters.status.length > 0) {
      filters.push({
        or: pfilters.status.map((t) => ({ status: { eq: GetStatus(t.value) } })),
      })
    }

    //grantTypeInsert
    if (pfilters.grantTypeInsert && pfilters.grantTypeInsert.length > 0) {
      filters.push({
        or: pfilters.grantTypeInsert.map((t) => ({ grantTypeInsert: { eq: GetGrantTypeInsert(t.value) } })),
      })
    }

    //category
    if (pfilters.category && pfilters.category.length > 0) {
      filters.push({
        or: pfilters.category.map((t) => ({ category: { eq: GetCategory(t.value) } })),
      })
    }

    //bftypes
    if (pfilters.bftypes && pfilters.bftypes.length > 0) {
      filters.push({
        or: pfilters.bftypes.map((t) => ({ grant: { BeneficiaryTypes: { any: { BeneficiaryTypeId: { eq: t.value } } } } })),
      })
    }


    //sectors
    if (pfilters.sectors && pfilters.sectors.length > 0) {
      filters.push({
        or: pfilters.sectors.map((t) => ({ grant: { Sectors: { any: { SectorId: { eq: t.value } } } } })),
      })
    }

    //Typologies
    if (pfilters.typologies && pfilters.typologies.length > 0) {
      filters.push({
        or: pfilters.typologies.map((t) => ({ grant: { Typologies: { any: { TypologyId: { eq: t.value } } } } })),
      })
    }

    //Countries
    if (pfilters.countries && pfilters.countries.length > 0) {
      filters.push({
        or: pfilters.countries.map((t) => ({ grant: { Countries: { any: { CountryId: { eq: t.value } } } } })),
      })
    }

    //TargetSectors
    if (pfilters.targetSectors && pfilters.targetSectors.length > 0) {
      filters.push({
        or: pfilters.targetSectors.map((t) => ({ grant: { targetSectors: { any: { TargetSectorId: { eq: t.value } } } } })),
      })
    }
  }

  return filters
}

export function BuildFilters(pfilters: GrantFilters): any[] {
  let filters: any[] = []
  if (pfilters) {
    //country
    if (pfilters.countryId) {
      filters.push({
        countryId: { eq: pfilters.countryId },
      })
    }
    //published
    if (typeof pfilters.published === 'boolean') {
      filters.push({
        published: { eq: pfilters.published },
      })
    }

    //interest
    if (pfilters.interest != undefined) {
      filters.push({
        interest: { eq: pfilters.interest == 1 },
      })
    }

    //deleted
    if (typeof pfilters.deleted === 'boolean') {
      filters.push({
        published: { eq: pfilters.deleted },
      })

    }
    //annuity
    if (pfilters.annuities && pfilters.annuities.length > 0) {
      filters.push({
        or: pfilters.annuities.map((t) => ({ Annuities: { any: { AnnuityId: { eq: t.value } } } })),
      })
    }


    //locations
    if (pfilters.locations && pfilters.locations.length > 0) {
      filters.push({
        or: pfilters.locations.map((t) => ({ Locations: { any: { LocationId: { eq: t.value } } } })),
      })
    }

    //minimis
    if (pfilters.minimis != undefined) {
      filters.push({
        minimis: { eq: pfilters.minimis == 1 },
      })
    }

    //bfsources
    if (pfilters.sources != undefined) {
      filters.push({
        or: pfilters.sources == 1 ? [{ Source: { eq: 'Private' } }, { Source: { eq: 'Both' } }] : ['Public', 'Unknown', 'Both'].map((t) => ({ Source: { eq: t } })),
      })
    }

    //status
    if (pfilters.status && pfilters.status.length > 0) {
      filters.push({
        or: pfilters.status.map((t) => ({ status: { eq: GetStatus(t.value) } })),
      })
    }

    //grantTypeInsert
    if (pfilters.grantTypeInsert && pfilters.grantTypeInsert.length > 0) {
      filters.push({
        or: pfilters.grantTypeInsert.map((t) => ({ grantTypeInsert: { eq: GetGrantTypeInsert(t.value) } })),
      })
    }

    if (pfilters.category && pfilters.category.length > 0) {
      filters.push({
        or: pfilters.category.map((t) => ({ category: { eq: GetCategory(t.value) } })),
      })
    }

    //bftypes
    if (pfilters.bftypes && pfilters.bftypes.length > 0) {
      filters.push({
        or: pfilters.bftypes.map((t) => (
          {
            BeneficiaryTypes:
            {
              any:
              {
                BeneficiaryTypeId: { eq: t.value }
              }
            }
          }
        )),
      })
    }

    //Typologies  

    if (pfilters.typologies && pfilters.typologies.length > 0) {
      filters.push({
        or: pfilters.typologies.map((t) => (
          {
            Typologies:
            {
              any:
              {
                TypologyId:
                  { eq: t.value }
              }
            }

          })),
      })
    }

    //sectors
    if (pfilters.sectors && pfilters.sectors.length > 0) {
      filters.push({
        or: pfilters.sectors.map((t) => (
          {
            Sectors:
            {
              any:
              {
                SectorId: { eq: t.value }
              }
            }
          }
        )),
      })
    }

    //Countries
    if (pfilters.countries && pfilters.countries.length > 0) {
      filters.push({
        or: pfilters.countries.map((t) => ({ countryId: { eq: t.value }})),
      })
    }

    //TargetSectors
    if (pfilters.targetSectors && pfilters.targetSectors.length > 0) {
      filters.push({
        or: pfilters.targetSectors.map((t) => (
          {
            TargetSectors:
            {
              any:
              {
                targetSectorId: { eq: t.value }
              }
            }
          }
        )),
      })
    }

  }
  return filters
}
