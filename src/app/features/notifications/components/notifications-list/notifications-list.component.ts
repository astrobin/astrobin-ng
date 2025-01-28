import { Component, OnInit } from "@angular/core";
import { MainState } from "@app/store/state";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { TitleService } from "@core/services/title/title.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { map, take, takeUntil } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { LoadNotifications, MarkAllAsRead, MarkAsRead, NotificationsActionTypes } from "@features/notifications/store/notifications.actions";
import { selectNotifications } from "@features/notifications/store/notifications.selectors";
import { LoadingService } from "@core/services/loading.service";
import { Actions, ofType } from "@ngrx/effects";

@Component({
  selector: "astrobin-notifications-list",
  templateUrl: "./notifications-list.component.html",
  styleUrls: ["./notifications-list.component.scss"]
})
export class NotificationsListComponent extends BaseComponentDirective implements OnInit {
  page: number = 1;
  pageTitle = this.translate.instant("Notifications");
  onlyUnread = true;
  read = false;
  refreshing = true;

  protected unreadCount$ = this.store$.select(state => state.notifications.unreadCount).pipe(takeUntil(this.destroyed$));
  protected totalNotifications$ = this.store$.select(state => state.notifications.totalNotifications).pipe(takeUntil(this.destroyed$));
  protected notifications$ = this.store$.select(selectNotifications).pipe(takeUntil(this.destroyed$), map(state => state.notifications));

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    try {
      this.page = +this.activatedRoute.snapshot?.queryParamMap.get("page") || 1;
    } catch (e) {
      this.page = 1;
    }

    this.actions$.pipe(
      ofType(NotificationsActionTypes.LOAD_NOTIFICATIONS_SUCCESS),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.refreshing = false;
    });

    this.loadNotifications();
  }

  refreshNotifications(): void {
    this.page = 1;
    this.refreshing = true;
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.store$.dispatch(new LoadNotifications({ page: this.page, read: this.read }));
  }

  toggleRead(notification: NotificationInterface): void {
    this.store$.dispatch(new MarkAsRead({ notificationId: notification.id, read: !notification.read }));
  }

  markAllAsRead(): void {
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_ALL_AS_READ_SUCCESS),
      take(1)
    ).subscribe(() => {
      this.loadNotifications();
    });

    this.store$.dispatch(new MarkAllAsRead());
  }

  toggleShowRead(value: boolean): void {
    this.onlyUnread = value;
    if (this.onlyUnread) {
      this.read = false;
    } else {
      this.read = undefined;
    }
    this.page = 1;

    this.loadNotifications();
  }

  pageChange(page: number): void {
    this.page = page;
    this.router.navigateByUrl(`/notifications?page=${page}`).then(() => {
      this.loadNotifications();
    });
  }

  notificationClicked(notification: NotificationInterface): boolean {
    const _openNotificationLink = (withNid: boolean, openInNewTab: boolean) => {
      const links = UtilsService.getLinksInText(notification.message);
      if (links.length > 0) {
        const link = withNid ? UtilsService.addOrUpdateUrlParam(links[0], "nid", "" + notification.id) : links[0];
        UtilsService.openLink(this.windowRefService.nativeWindow.document, link, {
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
          this.store$.dispatch(new MarkAsRead({ notificationId: notification.id, read: true }));
        }
      });

    return false;
  }
}
