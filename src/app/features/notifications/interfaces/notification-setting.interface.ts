import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";

export enum NotificationMedium {
  ON_SITE,
  EMAIL
}

export interface NotificationSettingInterface {
  id: number;
  user: number;
  noticeType: NotificationTypeInterface["id"];
  medium: NotificationMedium;
  send: boolean;
}
