import DataStore from 'src/core/stores/data-store';

export interface SectorSummary {
  name: string;
  id: string;
}

export class SectorStore extends DataStore<SectorSummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/sectors`;
  }
}
