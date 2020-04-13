import { Injectable } from "@angular/core";
import { UserInterface } from "@app/library/interfaces/user.interface";
import { BaseClassicApiService } from "@lib/services/api/classic/base-classic-api.service";
import { Observable, of } from "rxjs";

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
  providedIn: "root"
})
export class NotificationsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/notifications/notification";

  getAll(): Observable<NotificationInterface> {
    return of(null);
  }
}
