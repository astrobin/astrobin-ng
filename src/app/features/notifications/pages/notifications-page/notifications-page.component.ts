import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { TitleService } from "@shared/services/title/title.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { take } from "rxjs/operators";

@Component({
  selector: "astrobin-notifications-page",
  templateUrl: "./notifications-page.component.html",
  styleUrls: ["./notifications-page.component.scss"]
})
export class NotificationsPageComponent extends BaseComponentDirective implements OnInit {
  page = 1;
  pageTitle = this.translate.instant("Notifications");

  constructor(
    public readonly store$: Store<State>,
    public readonly notificationsService: NotificationsService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly windowRef: WindowRefService
  ) {
    super();

    titleService.setTitle(this.pageTitle);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: this.pageTitle }]
      })
    );
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

  notificationClicked(notification: NotificationInterface): boolean {
    const _openNotificationLink = (withNid: boolean, openInNewTab: boolean) => {
      const links = this.utilsService.getLinksInText(notification.message);
      if (links.length > 0) {
        const link = withNid ? this.utilsService.addOrUpdateUrlParam(links[0], "nid", "" + notification.id) : links[0];
        this.utilsService.openLink(this.windowRef.nativeWindow.document, link, {
          openInNewTab
        });
      }
    };

    this.store$
      .select(selectCurrentUserProfile)
      .pipe(take(1))
      .subscribe(userProfile => {
        _openNotificationLink(!notification.read, userProfile.openNotificationsInNewTab);

        if (!notification.read) {
          this.notificationsService
            .markAsRead(notification)
            .pipe(take(1))
            .subscribe();
        }
      });

    return false;
  }
}
