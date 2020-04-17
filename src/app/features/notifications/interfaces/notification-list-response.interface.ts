import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";

export interface NotificationListResponseInterface {
  count: number;
  next: string;
  previous: string;
  results: NotificationInterface[];
}
