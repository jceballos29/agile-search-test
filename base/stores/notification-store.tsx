import DataStore from 'src/core/stores/data-store'
import FormStore from 'src/core/stores/form-store'

export enum NotificationFrequency {
  Daily = 0,
  Weekly = 1,
  Snapshots = 2,
}

export interface NotificationSubscriptionQuery {
  countryCode?: string
  annuity?: string
  searchQuery?: string
  locations?: any[]
  sectors?: any[]
  beneficiaryTypes?: any[]
  typologies?: any[]
  annuities?: any[],
  categories?: any[]
}
export interface CreateNotificationSubscriptionItem {
  title: string
  frequency: NotificationFrequency
  query?: NotificationSubscriptionQuery
  days: string
  userTimeZone: any
  /*subscriptionsType: number*/
}

export function NotificationFrequencyToString(notification: NotificationFrequency): string {
  switch (notification) {
    case NotificationFrequency.Daily:
      return 'Daily'
    case NotificationFrequency.Weekly:
      return 'Weekly'
    case NotificationFrequency.Snapshots:
      return 'Snapshots'
  }
  return ''
}

export function ParseNotificationFrequency(strvalue: string): NotificationFrequency {
  switch (strvalue) {
    case 'Daily':
      return NotificationFrequency.Daily
    case 'Weekly':
      return NotificationFrequency.Weekly
    case 'Snapshots':
      return NotificationFrequency.Snapshots
  }
  return NotificationFrequency.Daily
}

export interface NotificationSubscriptionSummary {
  id: string
  title: string
  frequency: string
  nextNotificationDate: Date
  lastNotificationTimeStamp: Date
  modifiedOn: Date
  query: NotificationSubscriptionQuery
  days: string
  userTimeZone: any
  countryIcon?: string
  subscriptionsType: number
  createdByDisplayName: string
  modifiedByDisplayName: string
}

export interface NotificationSubscriptionItem extends NotificationSubscriptionSummary { }

export class NotificationSubscriptionSummaryDataStore extends DataStore<NotificationSubscriptionSummary> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`, [])
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/subscriptions`
  }
}
export class NotificationSubscriptionItemFormStore extends FormStore<NotificationSubscriptionItem, CreateNotificationSubscriptionItem> {
  private publicUrl: string
  constructor(baseUrl: string) {
    super(`${baseUrl}`)
    this.publicUrl = baseUrl
    this.baseUrl = `${this.publicUrl}/api/v1/subscriptions`
  }

  public async load(id: string, admin: number = 0) {
    return this.handleCallAsync(async () => {
      const response = await this.httpService.get<NotificationSubscriptionItem>(`${this.baseUrl}/${encodeURIComponent(id)}/${encodeURIComponent(admin)}`)
      this._state.set((s) => {
        s.item = response.data
        return s
      })
      return response.data
    })
  }

  public async Delete(id: string) {
    return this.handleCallAsync(async () => {
      const response = await this.httpService.delete(`${this.baseUrl}/${encodeURIComponent(id)}`)
      return response.data
    })
  }
}
