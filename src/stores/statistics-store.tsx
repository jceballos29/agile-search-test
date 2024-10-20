import DataStore from 'src/core/stores/data-store';
import { GrantBase } from './grant-store';

export interface StatisticSummary extends GrantBase {
  category: string;
  views: number;
  idCardDownload: number;
  documentSummary: number,
  documentPresentation: number,
  documentJustification: number,
  documentRequest: number,
  documentFaqs: number,
  documentCall: number,
  documentRegulatoryBase: number,
  documentModification: number,
  documentResolution: number
}

export class StatisticsStore extends DataStore<StatisticSummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/statistics/grantStatistics`;
  }
}

export class StatisticsFiltersStore extends DataStore<any> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/statistics/GetSearchFilterStatistics`;
  }
}
