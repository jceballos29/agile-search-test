import { Container } from 'inversify'
import * as React from 'react'
import 'reflect-metadata'
import { AppConfiguration, ConfigurationService } from 'src/core/services/configuration.service'
import HttpService from 'src/core/services/http.service'
import { PreferencesService } from 'src/core/services/preferences.service'
import { AnnuityStore } from 'src/stores/annuity-store'
import { BeneficiaryTypeStore } from 'src/stores/beneficiary-type-store'
import { CountryStore, CountryItemStore } from 'src/stores/country-store'
import {
  GrantSummaryStore,
  GrantBriefSummaryStore,
  ConfigurationGrantSummaryStore,
  GrantItemStore,
  GrantHistorySummaryStore,
  TopGrantSummaryStore,
  FeaturedGrantSummaryStore,
  FileGrantSummaryStore,
  FileTypeGrantSummaryStore,
  FileAttachmentGrantSummaryStore
} from 'src/stores/grant-store'
import { KeywordStore } from 'src/stores/keyword-store'
import { LocationStore } from 'src/stores/location-store'
import { SectorStore } from 'src/stores/sector-store'
import { TypologyStore } from 'src/stores/typology-store'
import { NotificationSubscriptionItemFormStore, NotificationSubscriptionSummaryDataStore } from 'src/stores/notification-store'
import { DimensionMapperSummaryDataStore, DimensionMapperItemDataStore } from 'src/stores/dimension-mapper-store'
import { ConfigSettingSummaryDataStore } from 'src/stores/config-setting-store'
import { NotificationItemStore } from './stores/systemNotifications/notification-store'
import { ProjectGroupsStore } from 'src/stores/projectGroups-store'
import { TargetSectorStore } from './stores/targetSector-store'
import { FeaturedMessageStorage, FeaturedMessageStorageSummary } from 'src/stores/featured-messages-store'
import { WhatsNewStore } from './stores/WhatsNew-store'
import { StatisticsFiltersStore, StatisticsStore } from './stores/statistics-store'

// Initialize DI/IoC container
const container = new Container()

const AppConfig = React.createContext<AppConfiguration>({} as any)

function initialize(config?: any) {
  let baseUri = process.env.PUBLIC_URL || config ? config.serviceUrl || config.ServiceUrl : `${window.location.protocol}//${window.location.host}`
  if (!container.isBound(HttpService)) {
    // Initialize services if container is not configured before
    container
      .bind(HttpService)
      .toSelf()
      .inSingletonScope()
      .onActivation((_: any, instance: any) => {
        instance.setup(baseUri)
        return instance
      })
  }

  // Initialize services
  container
    .bind(ConfigurationService)
    .toSelf()
    .inSingletonScope()
    .onActivation((_, instance) => {
      instance.current()
      return instance
    })

  container
    .bind(PreferencesService)
    .toSelf()
    .inSingletonScope()
    .onActivation((_, instance) => {
      instance.current()
      return instance
    })

  container.bind(ConfigSettingSummaryDataStore).toConstantValue(new ConfigSettingSummaryDataStore(baseUri))
  container.bind(AnnuityStore).toConstantValue(new AnnuityStore(baseUri))
  container.bind(BeneficiaryTypeStore).toConstantValue(new BeneficiaryTypeStore(baseUri))
  container.bind(CountryStore).toConstantValue(new CountryStore(baseUri))
  container.bind(FeaturedMessageStorageSummary).toConstantValue(new FeaturedMessageStorageSummary(baseUri))
  container.bind(GrantSummaryStore).toConstantValue(new GrantSummaryStore(baseUri))
  container.bind(GrantBriefSummaryStore).toConstantValue(new GrantBriefSummaryStore(baseUri))
  container.bind(ConfigurationGrantSummaryStore).toConstantValue(new ConfigurationGrantSummaryStore(baseUri))
  container.bind(FeaturedGrantSummaryStore).toConstantValue(new FeaturedGrantSummaryStore(baseUri))
  container.bind(TopGrantSummaryStore).toConstantValue(new TopGrantSummaryStore(baseUri))
  container.bind(GrantHistorySummaryStore).toConstantValue(new GrantHistorySummaryStore(baseUri))
  container.bind(KeywordStore).toConstantValue(new KeywordStore(baseUri))
  container.bind(GrantItemStore).toConstantValue(new GrantItemStore(baseUri))
  container.bind(LocationStore).toConstantValue(new LocationStore(baseUri))
  container.bind(TypologyStore).toConstantValue(new TypologyStore(baseUri))
  container.bind(SectorStore).toConstantValue(new SectorStore(baseUri))
  container.bind(TargetSectorStore).toConstantValue(new TargetSectorStore(baseUri))
  container.bind(NotificationSubscriptionItemFormStore).toConstantValue(new NotificationSubscriptionItemFormStore(baseUri))
  container.bind(NotificationSubscriptionSummaryDataStore).toConstantValue(new NotificationSubscriptionSummaryDataStore(baseUri))
  container.bind(DimensionMapperItemDataStore).toConstantValue(new DimensionMapperItemDataStore(baseUri))
  container.bind(DimensionMapperSummaryDataStore).toConstantValue(new DimensionMapperSummaryDataStore(baseUri))
  container.bind(CountryItemStore).toConstantValue(new CountryItemStore(baseUri))
  container.bind(NotificationItemStore).toConstantValue(new NotificationItemStore(baseUri))
  container.bind(ProjectGroupsStore).toConstantValue(new ProjectGroupsStore(baseUri))
  container.bind(FeaturedMessageStorage).toConstantValue(new FeaturedMessageStorage(baseUri))
  container.bind(WhatsNewStore).toConstantValue(new WhatsNewStore(baseUri))
  container.bind(FileGrantSummaryStore).toConstantValue(new FileGrantSummaryStore(baseUri))
  container.bind(FileTypeGrantSummaryStore).toConstantValue(new FileTypeGrantSummaryStore(baseUri))
  container.bind(FileAttachmentGrantSummaryStore).toConstantValue(new FileAttachmentGrantSummaryStore(baseUri))
  container.bind(StatisticsStore).toConstantValue(new StatisticsStore(baseUri))
  container.bind(StatisticsFiltersStore).toConstantValue(new StatisticsFiltersStore(baseUri))
}

export { container, initialize, AppConfig }
