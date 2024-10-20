import DataStore from 'src/core/stores/data-store';
import { CountrySummary } from './country-store';

export interface Message {
    id: number;
    messageTitle: string;
    message: string;
    departments: string[];
    offices: string[];
    areas: string[];
    startPublicationDate: Date;
    endPublicationDate: Date;
}


export interface ListFeaturedMessage {
    id: number;
    messageTitle: string;
    message: string;
    departments: string[];
    offices: string[];
    areas: string[];
    startPublicationDate: Date;
    endPublicationDate: Date;
}

export interface ListFeaturedMessageSummary {
    id: number;
    messageTitle: string;
    message: string;
    departments: string[];
    areas: string[];
}


export class FeaturedMessageStorage extends DataStore<ListFeaturedMessage> {
    private publicUrl: string;
    constructor(baseUrl: string) {
        super(`${baseUrl}`, []);
        this.publicUrl = baseUrl;
        this.baseUrl = `${this.publicUrl}/api/v1/featured-messages`;
    }
}

export class FeaturedMessageStorageSummary extends DataStore<ListFeaturedMessageSummary> {
    private publicUrl: string;
    constructor(baseUrl: string) {
        super(`${baseUrl}`, []);
        this.publicUrl = baseUrl;
        this.baseUrl = `${this.publicUrl}/api/v1/featured-messages/summary`;
    }
}