import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NotificationListResponseInterface } from "@features/notifications/interfaces/notification-list-response.interface";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";

@Injectable({
  providedIn: "root"
})
export class NotificationsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/notifications";

  constructor(public loadingService: LoadingService, public http: HttpClient) {
    super(loadingService);
  }

  getAll(page = 1): Observable<NotificationListResponseInterface> {
    return this.http.get<NotificationListResponseInterface>(`${this.configUrl}/notification/?page=${page}`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/notification/get_unread_count/`);
  }

  update(notification: NotificationInterface): Observable<void> {
    if (!notification.extraTags) {
      notification.extraTags = "-";
    }

    return this.http.put<void>(`${this.configUrl}/notification/${notification.id}/`, notification);
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/notification/mark_all_as_read/`, null);
  }

  markAsReadByPathAndUser(path: string, fromUserPk: number): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/notification/mark-as-read-by-path-and-user/`, {
      path,
      fromUserPk
    });
  }

  getTypes(): Observable<NotificationTypeInterface[]> {
    return this.http.get<NotificationTypeInterface[]>(`${this.configUrl}/type/`);
  }

  getSettings(): Observable<NotificationSettingInterface[]> {
    return this.http.get<NotificationSettingInterface[]>(`${this.configUrl}/setting/`);
  }

  setSetting(setting: NotificationSettingInterface): Observable<NotificationSettingInterface> {
    return this.http.put<NotificationSettingInterface>(`${this.configUrl}/setting/${setting.id}/`, setting);
  }
}
