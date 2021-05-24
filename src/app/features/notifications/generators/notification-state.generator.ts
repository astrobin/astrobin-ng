import { NotificationsState } from "@features/notifications/store/notifications.reducers";

export class NotificationStateGenerator {
  static default(): NotificationsState {
    return {
      types: [],
      settings: []
    };
  }
}
