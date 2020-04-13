import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@lib/services/api/classic/base-classic-api.service";
import { Observable, of } from "rxjs";
import { UserInterface } from "@app/library/interfaces/user.interface";

interface NotificationInterface {
  user: UserInterface;
  fromUser?: UserInterface;
  subject: string;
  message: string;
  level: number;
  extraTags: string;
  created: Date;
  modified: Date;
  read: boolean;
  expires?: Date;
  closeTimeout?: Date;
}

@Injectable({
  providedIn: "root",
})
export class NotificationsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/notifications/notification";

  getAll(): Observable<NotificationInterface> {
    return of(null);
  }
}
