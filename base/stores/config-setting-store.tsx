import DataStore from 'src/core/stores/data-store';
import FormStore from 'src/core/stores/form-store';

export interface ConfigSettingSummary {
  key: string;
  value: string;
}

export class ConfigSettingSummaryDataStore extends DataStore<ConfigSettingSummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/configsettings`;
  }

  public async update(id: string, item: any) {
    return await this.save(id, item);
  }
}
