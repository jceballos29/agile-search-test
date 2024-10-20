import DataStore from 'src/core/stores/data-store';

export interface BeneficiaryTypeSummary {
  name: string;
  id: string;
}

export class BeneficiaryTypeStore extends DataStore<BeneficiaryTypeSummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/beneficiaryTypes`;
  }
}
