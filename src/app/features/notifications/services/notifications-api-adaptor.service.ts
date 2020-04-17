import { Injectable } from "@angular/core";
import { NotificationListResponseInterface } from "@features/notifications/interfaces/notification-list-response.interface";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";

export interface BackendNotificationInterface {
  id: number;
  user: number;
  from_user?: number;
  subject: string;
  message: string;
  level: number;
  extra_tags: string;
  created: string;
  modified: string;
  read: boolean;
  expires?: string;
  close_timeout?: number;
}

export interface BackendNotificationListResponseInterface {
  count: number;
  next: string;
  previous: string;
  results: BackendNotificationInterface[];
}

@Injectable({
  providedIn: "root"
})
export class NotificationsApiAdaptorService {
  notificationFromBackend(notification: BackendNotificationInterface): NotificationInterface {
    return {
      id: notification.id,
      user: notification.user,
      fromUser: notification.from_user,
      subject: notification.subject,
      message: notification.message,
      level: notification.level,
      extraTags: notification.extra_tags,
      created: new Date(notification.created),
      modified: new Date(notification.modified),
      read: notification.read,
      expires: new Date(notification.expires),
      closeTimeout: notification.close_timeout
    };
  }

  notificationToBackend(notification: NotificationInterface): BackendNotificationInterface {
    return {
      id: notification.id,
      user: notification.user,
      from_user: notification.fromUser,
      subject: notification.subject,
      message: notification.message,
      level: notification.level,
      extra_tags: notification.extraTags ? notification.extraTags : "-",
      created: notification.created.toISOString(),
      modified: notification.modified.toISOString(),
      read: notification.read,
      expires: notification.expires.toISOString(),
      close_timeout: notification.closeTimeout
    };
  }

  notificationListResponseFromBackend(
    response: BackendNotificationListResponseInterface
  ): NotificationListResponseInterface {
    return {
      count: response.count,
      next: response.next,
      previous: response.previous,
      results: response.results.map(result => this.notificationFromBackend(result))
    };
  }
}
