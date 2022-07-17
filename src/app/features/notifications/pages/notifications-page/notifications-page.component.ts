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
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "astrobin-notifications-page",
  templateUrl: "./notifications-page.component.html",
  styleUrls: ["./notifications-page.component.scss"]
})
export class NotificationsPageComponent extends BaseComponentDirective implements OnInit {
  page;
  pageTitle = this.translate.instant("Notifications");

  constructor(
    public readonly store$: Store<State>,
    public readonly notificationsService: NotificationsService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly windowRef: WindowRefService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
  ) {
    super(store$);

    titleService.setTitle(this.pageTitle);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: this.pageTitle }]
      })
    );
  }

  ngOnInit(): void {
    this.page = this.activatedRoute.snapshot.queryParamMap.get("page") || 1;
    this.notificationsService.refresh();
  }

  toggleRead(notification: NotificationInterface): void {
    this.notificationsService
      .markAsRead(notification, !notification.read)
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
    this.router.navigateByUrl(`/notifications?page=${page}`).then(() => {
      this.notificationsService.getAll(page).subscribe();
    });
  }

  notificationClicked(notification: NotificationInterface): boolean {
    const _openNotificationLink = (withNid: boolean, openInNewTab: boolean) => {
      const links = UtilsService.getLinksInText(notification.message);
      if (links.length > 0) {
        const link = withNid ? UtilsService.addOrUpdateUrlParam(links[0], "nid", "" + notification.id) : links[0];
        UtilsService.openLink(this.windowRef.nativeWindow.document, link, {
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
            .markAsRead(notification, true)
            .pipe(take(1))
            .subscribe();
        }
      });

    return false;
  }
}
