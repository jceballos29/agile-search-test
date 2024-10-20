import DataStore from 'src/core/stores/data-store';
import FormStore from 'src/core/stores/form-store';

export interface Mapperitem {
  value: number;
  label: string;
}

export interface DimensionMapperItem {
  id: string;
  dimensionName: string;
    countryCode: string;
    countryIcon: string;
  dimensionType: string;
  dimensionsIds: number[];
  mappers: Mapperitem[];
}

export class DimensionMapperSummaryDataStore extends DataStore<DimensionMapperItem> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/dimensionmappers`;
  }

  public async update(id: string, item: any) {
    return await this.save(id, item);
  }
}
export class DimensionMapperItemDataStore extends FormStore<DimensionMapperItem, DimensionMapperItem> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/dimensionmappers`;
  }

  public async load(id: string) {
    return this.handleCallAsync(async () => {
      const response = await this.httpService.get<DimensionMapperItem>(`${this.baseUrl}/${encodeURIComponent(id)}`);
      this._state.set((s) => {
        s.item = response.data;
        return s;
      });
      return response.data;
    });
  }
}
