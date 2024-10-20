import DataStore from 'src/core/stores/data-store';

export interface KeywordSummary {
  name: string;
  id: string;
}

export class KeywordStore extends DataStore<KeywordSummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/keywords`;
  }
}
