import DataStore from 'src/core/stores/data-store';

export interface AnnuitySummary {
  name: string;
  id: string;
}

export class AnnuityStore extends DataStore<AnnuitySummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/annuities`;
  }
}
