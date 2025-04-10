import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { NotificationListResponseInterface } from "@features/notifications/interfaces/notification-list-response.interface";
import { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";
import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import { NotificationContext, NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class NotificationsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/notifications";

  constructor(public loadingService: LoadingService, public http: HttpClient) {
    super(loadingService);
  }

  getAll(
    page = 1,
    read?: boolean,
    context?: NotificationContext,
    message?: string | null
  ): Observable<NotificationListResponseInterface> {
    let url = `${this.configUrl}/notification/?page=${page}`;

    if (read !== undefined) {
      url = UtilsService.addOrUpdateUrlParam(url, "read", read.toString());
    }

    if (context) {
      url = UtilsService.addOrUpdateUrlParam(url, "context_search", context);
    }

    if (message) {
      url = UtilsService.addOrUpdateUrlParam(url, "message", message);
    }

    return this.http.get<NotificationListResponseInterface>(url);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/notification/get_unread_count/`);
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/notification/mark_all_as_read/`, null);
  }

  markAsReadByPathAndUser(path: string, fromUserPk: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/notification/mark-as-read-by-path-and-user/`, {
      path,
      fromUserPk
    });
  }

  markAsRead(notificationId: NotificationInterface["id"], read: boolean): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/notification/${notificationId}/mark-as-read/`, { read });
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
