/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { Action } from "@ngrx/store";
import { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";
import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import { NotificationContext, NotificationInterface } from "@features/notifications/interfaces/notification.interface";

export enum NotificationsActionTypes {
  LOAD_TYPES = "[Notifications] Load types",
  LOAD_TYPES_SUCCESS = "[Notifications] Load types success",

  LOAD_SETTINGS = "[Notifications] Load settings",
  LOAD_SETTINGS_SUCCESS = "[Notifications] Load settings success",

  SET_SETTING = "[Notifications] Set setting",
  SET_SETTING_SUCCESS = "[Notifications] Set setting success",

  LOAD_NOTIFICATIONS = "[Notifications] Load notifications",
  LOAD_NOTIFICATIONS_SUCCESS = "[Notifications] Load notifications success",
  LOAD_NOTIFICATIONS_FAILURE = "[Notifications] Load notifications failure",

  GET_UNREAD_COUNT = "[Notifications] Get unread count",
  GET_UNREAD_COUNT_SUCCESS = "[Notifications] Get unread count success",
  GET_UNREAD_COUNT_FAILURE = "[Notifications] Get unread count failure",

  MARK_ALL_AS_READ = "[Notifications] Mark all as read",
  MARK_ALL_AS_READ_SUCCESS = "[Notifications] Mark all as read success",
  MARK_ALL_AS_READ_FAILURE = "[Notifications] Mark all as read failure",

  MARK_AS_READ = "[Notifications] Mark as read",
  MARK_AS_READ_SUCCESS = "[Notifications] Mark as read success",
  MARK_AS_READ_FAILURE = "[Notifications] Mark as read failure",
}

export class LoadNotificationTypes implements Action {
  readonly type = NotificationsActionTypes.LOAD_TYPES;
}

export class LoadNotificationTypesSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_TYPES_SUCCESS;

  constructor(public payload: { types: NotificationTypeInterface[] }) {
  }
}

export class LoadNotificationSettings implements Action {
  readonly type = NotificationsActionTypes.LOAD_SETTINGS;
}

export class LoadNotificationSettingsSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_SETTINGS_SUCCESS;

  constructor(public payload: { settings: NotificationSettingInterface[] }) {
  }
}

export class SetNotificationSetting implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.SET_SETTING;

  constructor(public payload: { setting: NotificationSettingInterface }) {
  }
}

export class SetNotificationSettingSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.SET_SETTING_SUCCESS;

  constructor(public payload: { setting: NotificationSettingInterface }) {
  }
}

export class LoadNotifications implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_NOTIFICATIONS;

  constructor(public payload: {
    page: number,
    read?: boolean,
    context?: NotificationContext,
    message?: string | null
  }) {
  }
}

export class LoadNotificationsSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_NOTIFICATIONS_SUCCESS;

  constructor(public payload: {
    notifications: NotificationInterface[],
    total: number
  }) {
  }
}

export class LoadNotificationsFailure implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_NOTIFICATIONS_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class GetUnreadCount implements Action {
  readonly type = NotificationsActionTypes.GET_UNREAD_COUNT;
}

export class GetUnreadCountSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.GET_UNREAD_COUNT_SUCCESS;

  constructor(public payload: { count: number }) {
  }
}

export class GetUnreadCountFailure implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.GET_UNREAD_COUNT_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class MarkAllAsRead implements Action {
  readonly type = NotificationsActionTypes.MARK_ALL_AS_READ;
}

export class MarkAllAsReadSuccess implements Action {
  readonly type = NotificationsActionTypes.MARK_ALL_AS_READ_SUCCESS;
}

export class MarkAllAsReadFailure implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.MARK_ALL_AS_READ_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class MarkAsRead implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.MARK_AS_READ;

  constructor(public payload: { notificationId: NotificationInterface["id"], read: boolean }) {
  }
}

export class MarkAsReadSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.MARK_AS_READ_SUCCESS;

  constructor(public payload: { notificationId: NotificationInterface["id"], read: boolean }) {
  }
}

export class MarkAsReadFailure implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.MARK_AS_READ_FAILURE;

  constructor(public payload: { notificationId: NotificationInterface["id"], error: string }) {
  }
}

export type All =
  | LoadNotificationTypes
  | LoadNotificationTypesSuccess
  | LoadNotificationSettings
  | LoadNotificationSettingsSuccess
  | SetNotificationSetting
  | SetNotificationSettingSuccess
  | LoadNotifications
  | LoadNotificationsSuccess
  | LoadNotificationsFailure
  | GetUnreadCount
  | GetUnreadCountSuccess
  | GetUnreadCountFailure
  | MarkAllAsRead
  | MarkAllAsReadSuccess
  | MarkAllAsReadFailure
  | MarkAsRead
  | MarkAsReadSuccess
  | MarkAsReadFailure;
