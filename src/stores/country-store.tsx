import DataStore from 'src/core/stores/data-store';
import FormStore from '../core/stores/form-store';
import { CommandResult } from '../core/stores/types';

export interface CountrySummary {
  name: string;
    code: string;
    icon: string;
    currency: string;
}

export interface CountryItem {
    name: string;
    code: string;
    icon: string;
    iconUrl?: string;
    currency: string;
}


export class CountryStore extends DataStore<CountrySummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/countries`;
    }   
}

export class CountryItemStore extends FormStore<CountryItem, CountryItem> {
    private publicUrl: string;
    constructor(baseUrl: string) {
        super(`${baseUrl}`);
        this.publicUrl = baseUrl;
        this.baseUrl = `${this.publicUrl}/api/v1/countries`;
    }

    public async load(code: string) {
        return this.handleCallAsync(async () => {
            const response = await this.httpService.get<CountryItem>(`${this.baseUrl}/${encodeURIComponent(code)}`);
            this._state.set((s) => {
                s.item = response.data;
                return s;
            });
            return response.data;
        });
    }

    public async getAll() {
        return this.handleCallAsync(async () => {
            const response = await this.httpService.get<CountryItem>(`${this.baseUrl}`);
            this._state.set((s) => {
                s.item = response.data;
                return s;
            });
            return response.data;
        });
    }    
}
