import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import {
  selectNotificationSettings,
  selectNotificationTypes
} from "@features/notifications/store/notifications.selectors";
import { filter, map, switchMap, tap } from "rxjs/operators";
import {
  LoadNotificationSettings,
  LoadNotificationTypes,
  SetNotificationSetting
} from "@features/notifications/store/notifications.actions";
import {
  NotificationMedium,
  NotificationSettingInterface
} from "@features/notifications/interfaces/notification-setting.interface";
import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import { Observable } from "rxjs";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { NgbAccordion } from "@ng-bootstrap/ng-bootstrap";

enum NotificationCategory {
  COMMENTS = "COMMENTS",
  FORUMS = "FORUMS",
  IMAGES = "IMAGES",
  IOTD = "IOTD",
  IOTD_STAFF = "IOTD_STAFF",
  GROUPS = "GROUPS",
  OTHER = "OTHER",
  PRIVATE_MESSAGES = "PRIVATE_MESSAGES",
  SUBSCRIPTIONS = "SUBSCRIPTIONS",
  USERS = "USERS"
}

interface NotificationCategoriesInterface {
  [key: string]: {
    label: string;
    items: {
      [key: number]: NotificationSettingInterface;
    };
  };
}

@Component({
  selector: "astrobin-notifications-settings-page",
  templateUrl: "./settings-page.component.html",
  styleUrls: ["./settings-page.component.scss"]
})
export class SettingsPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  readonly categories: NotificationCategoriesInterface = {
    [NotificationCategory.USERS]: {
      label: this.translateService.instant("Users"),
      items: {}
    },
    [NotificationCategory.IMAGES]: {
      label: this.translateService.instant("Images"),
      items: {}
    },
    [NotificationCategory.COMMENTS]: {
      label: this.translateService.instant("Comments"),
      items: {}
    },
    [NotificationCategory.FORUMS]: {
      label: this.translateService.instant("Forums"),
      items: {}
    },
    [NotificationCategory.GROUPS]: {
      label: this.translateService.instant("Groups"),
      items: {}
    },
    [NotificationCategory.PRIVATE_MESSAGES]: {
      label: this.translateService.instant("Private messages"),
      items: {}
    },
    [NotificationCategory.SUBSCRIPTIONS]: {
      label: this.translateService.instant("Subscriptions"),
      items: {}
    },
    [NotificationCategory.IOTD]: {
      label: this.translateService.instant("Image of the Day / Top Picks"),
      items: {}
    },
    [NotificationCategory.IOTD_STAFF]: {
      label: this.translateService.instant("IOTD/TP Staff"),
      items: {}
    },
    [NotificationCategory.OTHER]: {
      label: this.translateService.instant("Other"),
      items: {}
    }
  };

  pageTitle: string = this.translateService.instant("Notification settings");

  notificationTypes: NotificationTypeInterface[];

  settingCategories$: Observable<NotificationCategoriesInterface["key"][]> = this.store$
    .select(selectNotificationTypes)
    .pipe(
      filter(types => !!types),
      switchMap(types => {
        this.notificationTypes = types;
        return this.store$.select(selectNotificationSettings).pipe(
          filter(settings => !!settings),
          map(settings => ({ types, settings }))
        );
      }),
      switchMap(data =>
        this.store$.select(selectCurrentUser).pipe(
          tap(user => {
            const isIotdStaff = user.groups.filter(group => group.name === "iotd_staff").length > 0;

            if (!isIotdStaff) {
              delete this.categories[NotificationCategory.IOTD_STAFF];
            }
          }),
          map(() => data)
        )
      ),
      map(data => {
        for (const setting of data.settings) {
          const category = this._getCategory(data.types.find(type => type.id === setting.noticeType));

          if (!!category && this.categories[category]) {
            this.categories[category].items[setting.noticeType] =
              this.categories[category].items[setting.noticeType] || ({} as NotificationSettingInterface);
            this.categories[category].items[setting.noticeType][NotificationMedium[setting.medium]] = setting;
          }
        }

        const categoryList: NotificationCategoriesInterface["key"][] = [];
        for (const item of Object.keys(this.categories)) {
          categoryList.push(this.categories[item]);
        }

        return categoryList;
      })
    );

  @ViewChild("accordion")
  accordion: NgbAccordion;

  constructor(
    public readonly store$: Store<State>,
    public readonly notificationsService: NotificationsService,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService
  ) {
    super(store$);

    titleService.setTitle(this.pageTitle);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          { label: this.translateService.instant("Notifications") },
          { label: this.translateService.instant("Settings") }
        ]
      })
    );
  }

  ngOnInit(): void {
    this.store$.dispatch(new LoadNotificationTypes());
    this.store$.dispatch(new LoadNotificationSettings());
  }

  ngAfterViewInit(): void {
    const expandAccordion = () => {
      if (!!this.accordion) {
        this.accordion.expandAll();
        return;
      }

      setTimeout(() => {
        expandAccordion();
      }, 100);
    };

    expandAccordion();
  }

  getNotificationTypeById(id: string) {
    return this.notificationTypes.find(type => type.id === parseInt(id, 10));
  }

  notificationSettingChanged(setting: NotificationSettingInterface, send: boolean): void {
    this.store$.dispatch(
      new SetNotificationSetting({
        setting: {
          ...setting,
          send
        }
      })
    );
  }

  private _getCategory(notificationType: NotificationTypeInterface): NotificationCategory {
    switch (notificationType.label) {
      case "your_image_is_tpn":
      case "your_image_is_tp":
      case "your_image_is_iotd":
        return NotificationCategory.IOTD;
      case "new_forum_post_mention":
      case "new_forum_reply":
      case "new_forum_post_like":
      case "forum_post_approved":
        return NotificationCategory.FORUMS;
      case "new_comment_mention":
      case "new_comment_reply":
      case "new_comment_like":
      case "new_comment":
      case "comment_approved":
        return NotificationCategory.COMMENTS;
      case "image_you_promoted_is_iotd":
      case "image_you_promoted_is_tp":
        return NotificationCategory.IOTD_STAFF;
      case "new_payment":
      case "expiring_subscription_autorenew_30d":
      case "expiring_subscription_autorenew":
      case "expiring_subscription":
      case "expired_subscription":
        return NotificationCategory.SUBSCRIPTIONS;
      case "received_email":
        return NotificationCategory.PRIVATE_MESSAGES;
      case "new_topic_in_group":
      case "group_join_request_rejected":
      case "group_join_request_approved":
      case "new_group_join_request":
      case "new_group_invitation":
      case "user_joined_public_group":
        return NotificationCategory.GROUPS;
      case "api_key_request_approved":
        return NotificationCategory.OTHER;
      case "new_image":
      case "new_image_revision":
      case "new_like":
      case "new_bookmark":
      case "image_not_solved":
      case "image_solved":
      case "image_not_solved_advanced":
      case "image_solved_advanced":
      case "new_image_description_mention":
        return NotificationCategory.IMAGES;
      case "new_follower":
        return NotificationCategory.USERS;
    }

    return null;
  }
}
