import DataStore from 'src/core/stores/data-store';

export interface TypologySummary {
  name: string;
  id: string;
}

export class TypologyStore extends DataStore<TypologySummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/typologies`;
  }
}
