import { NotificationListResponseInterfaceGenerator } from "@features/notifications/generators/notification-list-response.interface.generator";
import { NotificationServiceInterface } from "@features/notifications/services/notification.service-interface";
import { of } from "rxjs";

export class NotificationServiceMock implements NotificationServiceInterface {
  refresh = jest.fn();
  getAll = jest.fn().mockReturnValue(of(NotificationListResponseInterfaceGenerator.notificationListResponse()));
  getUnreadCount = jest.fn().mockReturnValue(of(1));
  update = jest.fn().mockReturnValue(of(void 0));
  markAsRead = jest.fn().mockReturnValue(of(void 0));
  markAsUnread = jest.fn().mockReturnValue(of(void 0));
  markAllAsRead = jest.fn().mockReturnValue(of(void 0));
}
