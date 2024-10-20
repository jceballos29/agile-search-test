import DataStore from 'src/core/stores/data-store';

export interface NotificationItem {
  id: string;
  userId: string;
  description: string;
  type: string;
  data: any;
  taskId: string;
  readed: boolean;
  creationTime: Date;
}

export class NotificationItemStore extends DataStore<NotificationItem> {
  constructor(baseUrl: string) {
    super(`${baseUrl}/api/v1/admin/notifications`, []);
  }

  public async SetReadStatus() {
    await this.httpService.put(this.baseUrl, {});
  }
  public async delete(id: string) {
    await this.httpService.delete(this.baseUrl + '/' + id, {});
  }
  public async deleteAll() {
    await this.httpService.delete(this.baseUrl, {});
  }
}
