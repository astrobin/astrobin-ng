import { Component, OnInit } from "@angular/core";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { ClassicRoutesService } from "@lib/services/classic-routes.service";
import { take } from "rxjs/operators";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";

@Component({
  selector: "astrobin-notifications-page",
  templateUrl: "./notifications-page.component.html",
  styleUrls: ["./notifications-page.component.scss"]
})
export class NotificationsPageComponent implements OnInit {
  page = 1;

  constructor(public notificationsService: NotificationsService, public classicRoutesService: ClassicRoutesService) {
  }

  ngOnInit(): void {
    this.notificationsService.refresh();
  }

  toggleRead(notification: NotificationInterface): void {
    const method = notification.read ? this.notificationsService.markAsUnread : this.notificationsService.markAsRead;

    method
      .call(this.notificationsService, notification)
      .pipe(take(1))
      .subscribe();
  }

  markAllAsRead(): void {
    this.notificationsService
      .markAllAsRead()
      .pipe(take(1))
      .subscribe();
  }

  pageChange(page: number): void {
    this.page = page;
    this.notificationsService
      .getAll(page)
      .pipe(take(1))
      .subscribe();
  }
}
