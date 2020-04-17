import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NotificationListResponseInterface } from "@features/notifications/interfaces/notification-list-response.interface";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import {
  BackendNotificationListResponseInterface,
  NotificationsApiAdaptorService
} from "@features/notifications/services/notifications-api-adaptor.service";
import { BaseClassicApiService } from "@lib/services/api/classic/base-classic-api.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class NotificationsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/notifications/notification";

  constructor(public http: HttpClient, public notificationsApiAdaptorService: NotificationsApiAdaptorService) {
    super();
  }

  getAll(page = 1): Observable<NotificationListResponseInterface> {
    return this.http
      .get<BackendNotificationListResponseInterface>(`${this.configUrl}?page=${page}`)
      .pipe(map(response => this.notificationsApiAdaptorService.notificationListResponseFromBackend(response)));
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/get_unread_count/`);
  }

  update(notification: NotificationInterface): Observable<void> {
    return this.http.put<void>(
      `${this.configUrl}/${notification.id}/`,
      this.notificationsApiAdaptorService.notificationToBackend(notification)
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/mark_all_as_read/`, null);
  }
}
