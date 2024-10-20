import DataStore from 'src/core/stores/data-store';
import FormStore from '../core/stores/form-store';

export interface WhatsNewSummary {
    lenguage: string;
    text: string;
    adminText: string;
}

export interface WhatsNew {

    lenguage: string;
    text: string;
    adminText: string;
}


export class WhatsNewStore extends FormStore<WhatsNew,WhatsNew> {
    private publicUrl: string;
    constructor(baseUrl: string) {
        super(`${baseUrl}`);
        this.publicUrl = baseUrl;
        this.baseUrl = `${this.publicUrl}/api/v1/whatsNew`;
    }
   
    public async load(language: string) {
        return this.handleCallAsync(async () => {
          
            const response = await this.httpService.get<WhatsNew>(`${this.baseUrl}/${encodeURIComponent(language)}`);
            this._state.set((s) => {
                s.item = response.data;
                return s;
            });
            return response.data;
        });
    }

}