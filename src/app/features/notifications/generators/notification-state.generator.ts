import type { NotificationsState } from "@features/notifications/store/notifications.reducers";

export class NotificationStateGenerator {
  static default(): NotificationsState {
    return {
      types: [],
      settings: [],
      notifications: [],
      unreadCount: 0,
      totalNotifications: 0
    };
  }
}
