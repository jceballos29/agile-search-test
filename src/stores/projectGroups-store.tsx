import DataStore from 'src/core/stores/data-store';

export interface ProjectGroupsSummary {
    name: string;
    id: string;
    area: string;    
}

export class ProjectGroupsStore extends DataStore<ProjectGroupsSummary> {
  private publicUrl: string;
  constructor(baseUrl: string) {
    super(`${baseUrl}`, []);
    this.publicUrl = baseUrl;
    this.baseUrl = `${this.publicUrl}/api/v1/projectGroups`;
  }
}
