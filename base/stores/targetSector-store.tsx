import DataStore from 'src/core/stores/data-store';

export interface TargetSectorSummary {
    name: string;
    id: string;
}

export class TargetSectorStore extends DataStore<TargetSectorSummary> {
    private publicUrl: string;
    constructor(baseUrl: string) {
        super(`${baseUrl}`, []);
        this.publicUrl = baseUrl;
        this.baseUrl = `${this.publicUrl}/api/v1/targetSector`;
    }
}
