import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit, OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID, ViewChild } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import { TitleService } from "@core/services/title/title.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import type { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";
import { NotificationMedium } from "@features/notifications/interfaces/notification-setting.interface";
import type { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import {
  LoadNotificationSettings,
  LoadNotificationTypes,
  SetNotificationSetting
} from "@features/notifications/store/notifications.actions";
import {
  selectNotificationSettings,
  selectNotificationTypes
} from "@features/notifications/store/notifications.selectors";
import { NgbAccordion } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import type { Observable } from "rxjs";
import { filter, map, switchMap, tap } from "rxjs/operators";

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
  USERS = "USERS",
  EQUIPMENT = "EQUIPMENT",
  EQUIPMENT_MODERATION = "EQUIPMENT_MODERATION",
  MARKETPLACE = "MARKETPLACE"
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
    [NotificationCategory.EQUIPMENT]: {
      label: this.translateService.instant("Equipment"),
      items: {}
    },
    [NotificationCategory.EQUIPMENT_MODERATION]: {
      label: this.translateService.instant("Equipment moderation"),
      items: {}
    },
    [NotificationCategory.MARKETPLACE]: {
      label: this.translateService.instant("Marketplace"),
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
            const isEquipmentModerator =
              user.groups.filter(group => group.name === Constants.EQUIPMENT_MODERATORS_GROUP).length > 0;

            if (!isIotdStaff) {
              delete this.categories[NotificationCategory.IOTD_STAFF];
            }

            if (!isEquipmentModerator) {
              delete this.categories[NotificationCategory.EQUIPMENT_MODERATION];
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
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId
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
    super.ngOnInit();

    this.store$.dispatch(new LoadNotificationTypes());
    this.store$.dispatch(new LoadNotificationSettings());
  }

  ngAfterViewInit(): void {
    const expandAccordion = () => {
      if (!!this.accordion) {
        this.accordion.expandAll();
        return;
      }

      this.utilsService.delay(100).subscribe(() => {
        expandAccordion();
      });
    };

    if (isPlatformBrowser(this.platformId)) {
      expandAccordion();
    }
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
      case "image_submitted_to_iotd_tp":
      case "your_image_is_tpn":
      case "your_image_is_tp":
      case "your_image_is_iotd":
      case "your_image_might_become_tpn":
      case "your_image_might_become_tp":
      case "iotd_tp_submission_deadline":
        return NotificationCategory.IOTD;
      case "new_forum_post_mention":
      case "new_forum_reply":
      case "new_forum_reply_started_topic":
      case "new_forum_post_like":
      case "forum_post_approved":
      case "new_topic_for_equipment_you_use":
      case "new_topic_for_equipment_you_follow":
      case "topic_moved":
        return NotificationCategory.FORUMS;
      case "new_comment_mention":
      case "new_comment_reply":
      case "new_comment_like":
      case "new_comment":
      case "new_comment_to_edit_proposal":
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
      case "new-image-from-followed-equipment":
      case "new_image_revision":
      case "new_like":
      case "new_bookmark":
      case "image_approved":
      case "image_not_solved":
      case "image_solved":
      case "image_not_solved_advanced":
      case "image_solved_advanced":
      case "new_image_description_mention":
      case "added_you_as_collaborator":
      case "removed_as_collaborator":
      case "requested_as_collaborator":
      case "accepted_collaboration_request":
      case "denied_collaboration_request":
        return NotificationCategory.IMAGES;
      case "new_follower":
        return NotificationCategory.USERS;
      case "equipment-item-approved":
      case "equipment-item-rejected":
      case "equipment-item-rejected-affected-image":
      case "equipment-edit-proposal-created":
      case "equipment-edit-proposal-approved":
      case "equipment-edit-proposal-rejected":
      case "equipment-item-migration-approved":
      case "equipment-item-migration-rejected":
      case "new_comment_to_unapproved_equipment_item":
        return NotificationCategory.EQUIPMENT;
      case "equipment-item-requires-moderation":
      case "equipment-item-assigned":
        return NotificationCategory.EQUIPMENT_MODERATION;
      case "new_comment_to_marketplace_private_conv":
      case "new_comment_to_marketplace_private_conv2":
      case "new_question_to_listing":
      case "marketplace-offer-created":
      case "marketplace-offer-created-buyer":
      case "marketplace-offer-updated":
      case "marketplace-offer-updated-buyer":
      case "marketplace-offer-accepted-by-seller":
      case "marketplace-offer-accepted-by-you":
      case "marketplace-offer-rejected-by-seller":
      case "marketplace-offer-retracted":
      case "marketplace-offer-retracted-buyer":
      case "marketplace-listing-updated":
      case "marketplace-listing-deleted":
      case "marketplace-listing-approved":
      case "marketplace-listing-expired":
      case "marketplace-listing-line-item-sold":
      case "marketplace-listing-by-user-you-follow":
      case "marketplace-listing-for-item-you-follow":
      case "marketplace-rate-seller":
      case "marketplace-rate-buyer":
      case "marketplace-mark-sold-reminder":
      case "comment-to-marketplace-feedback-received":
      case "comment-to-marketplace-feedback-left":
      case "marketplace-feedback-created":
      case "marketplace-feedback-updated":
        return NotificationCategory.MARKETPLACE;
    }

    return null;
  }
}
