import DataStore from 'src/core/stores/data-store';

export interface CountrySummary {
  name: string;
  id: string;
  countryCode: string;
    country: string;
    countryIcon: string;
}

export class LocationStore extends DataStore<CountrySummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/locations`;
  }
}
