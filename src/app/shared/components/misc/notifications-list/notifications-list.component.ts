import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { ImageInterface, ImageRevisionInterface, FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TitleService } from "@core/services/title/title.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { NotificationContext, NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import {
  LoadNotifications,
  MarkAllAsRead,
  MarkAsRead,
  NotificationsActionTypes
} from "@features/notifications/store/notifications.actions";
import { selectNotifications } from "@features/notifications/store/notifications.selectors";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { debounceTime, distinctUntilChanged, map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-notifications-list",
  templateUrl: "./notifications-list.component.html",
  styleUrls: ["./notifications-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsListComponent extends BaseComponentDirective implements OnInit {
  // If false, the component is part of the notifications page.
  @Input() standalone = false;

  // Event emitted when all notifications are marked as read
  @Output() allNotificationsMarkedAsRead = new EventEmitter<void>();

  protected page = 1;
  protected onlyUnread = true;
  protected read = false;
  protected refreshing = true;
  protected unreadCount$ = this.store$
    .select(state => state.notifications.unreadCount)
    .pipe(takeUntil(this.destroyed$));
  protected totalNotifications$ = this.store$
    .select(state => state.notifications.totalNotifications)
    .pipe(takeUntil(this.destroyed$));
  protected notifications: NotificationInterface[] = null;

  protected contextForm = new FormGroup({});
  protected contextFields: FormlyFieldConfig[] = [
    {
      key: "",
      fieldGroupClassName: "d-flex gap-2",
      fieldGroup: [
        {
          key: "message",
          type: "input",
          className: "flex-grow-1 mb-0",
          wrappers: ["default-wrapper"],
          props: {
            placeholder: this.translate.instant("Search")
          },
          hooks: {
            onInit: field => {
              field.formControl.valueChanges
                .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroyed$))
                .subscribe(() => {
                  this.contextModel.message = field.formControl.value;
                  this.refreshNotifications();
                });
            }
          }
        },
        {
          key: "context",
          type: "ng-select",
          className: "mb-0 context-select",
          wrappers: ["default-wrapper"],
          props: {
            clearable: true,
            placeholder: this.translate.instant("Filter"),
            options: [
              { value: NotificationContext.IMAGE, label: this.translate.instant("Images") },
              { value: NotificationContext.USER, label: this.translate.instant("Users") },
              { value: NotificationContext.FORUM, label: this.translate.instant("Forum") },
              { value: NotificationContext.MARKETPLACE, label: this.translate.instant("Marketplace") },
              { value: NotificationContext.GROUPS, label: this.translate.instant("Groups") },
              { value: NotificationContext.IOTD, label: this.translate.instant("IOTD/TP") },
              { value: NotificationContext.EQUIPMENT, label: this.translate.instant("Equipment") },
              { value: NotificationContext.SUBSCRIPTIONS, label: this.translate.instant("Subscriptions") },
              { value: NotificationContext.AUTHENTICATION, label: this.translate.instant("Authentication") },
              { value: NotificationContext.API, label: "API" }
            ]
          },
          hooks: {
            onInit: field => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
                this.contextModel.context = field.formControl.value;
                this.refreshNotifications();
              });
            }
          }
        }
      ]
    }
  ];
  protected contextModel = {
    message: null,
    context: null
  };

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
    public readonly loadingService: LoadingService,
    public readonly imageViewerService: ImageViewerService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public platformId: Object
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$
      .select(selectNotifications)
      .pipe(
        takeUntil(this.destroyed$),
        map(state => state.notifications)
      )
      .subscribe(notifications => {
        this.notifications = notifications;
        console.log(this.notifications);
        this.changeDetectorRef.markForCheck();
      });

    try {
      this.page = +this.activatedRoute.snapshot?.queryParamMap.get("page") || 1;
    } catch (e) {
      this.page = 1;
    }

    this.actions$
      .pipe(ofType(NotificationsActionTypes.LOAD_NOTIFICATIONS_SUCCESS), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.refreshing = false;
        this.changeDetectorRef.markForCheck();
      });

    this.loadNotifications();
  }

  refreshNotifications(): void {
    this.page = 1;
    this.refreshing = true;
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.store$.dispatch(
      new LoadNotifications({
        page: this.page,
        read: this.read,
        context: this.contextModel.context,
        message: this.contextModel.message
      })
    );
  }

  toggleRead(notification: NotificationInterface): void {
    this.store$.dispatch(new MarkAsRead({ notificationId: notification.id, read: !notification.read }));
  }

  markAllAsRead(): void {
    this.actions$.pipe(ofType(NotificationsActionTypes.MARK_ALL_AS_READ_SUCCESS), take(1)).subscribe(() => {
      this.loadNotifications();
      this.allNotificationsMarkedAsRead.emit();
      this.changeDetectorRef.markForCheck();
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

    if (this.standalone) {
      this.loadNotifications();

      if (isPlatformBrowser(this.platformId)) {
        const body = this.windowRefService.nativeWindow.document.querySelector(
          ".notifications-offcanvas .offcanvas-body"
        );

        if (body) {
          body.scrollTo({
            top: 0,
            behavior: "auto"
          });
        }
      }
    } else {
      this.router.navigateByUrl(`/notifications?page=${page}`).then(() => {
        this.loadNotifications();
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  notificationClicked(notification: NotificationInterface): boolean {
    this.store$
      .select(selectCurrentUserProfile)
      .pipe(take(1))
      .subscribe(userProfile => {
        this._openLink(
          notification,
          !notification.read,
          userProfile.openNotificationsInNewTab,
          userProfile.enableNewGalleryExperience
        );

        if (!notification.read) {
          this.store$.dispatch(new MarkAsRead({ notificationId: notification.id, read: true }));
        }

        this.changeDetectorRef.markForCheck();
      });

    return false;
  }

  private _openLink(
    notification: NotificationInterface,
    withNid: boolean,
    openInNewTab: boolean,
    newGalleryExperience: boolean
  ) {
    if (!openInNewTab && newGalleryExperience && notification.extraTags) {
      const extraTags: {
        context?: NotificationContext;
        image_id?: ImageInterface["hash"] | ImageInterface["pk"];
        revision_label?: ImageRevisionInterface["label"];
      } = JSON.parse(notification.extraTags);

      if (extraTags.context === NotificationContext.IMAGE && !!extraTags.image_id) {
        this.imageViewerService
          .openSlideshow(
            this.componentId,
            extraTags.image_id,
            extraTags.revision_label ?? FINAL_REVISION_LABEL,
            [],
            true
          )
          .subscribe(() => {
            this.changeDetectorRef.markForCheck();
          });
        return;
      }
    }

    const links = UtilsService.getLinksInText(notification.message);
    if (links.length > 0) {
      const link = withNid ? UtilsService.addOrUpdateUrlParam(links[0], "nid", "" + notification.id) : links[0];
      UtilsService.openLink(this.windowRefService.nativeWindow.document, link, {
        openInNewTab
      });
    }
  }
}
