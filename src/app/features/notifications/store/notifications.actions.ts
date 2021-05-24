// tslint:disable:max-classes-per-file

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { Action } from "@ngrx/store";
import { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";
import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";

export enum NotificationsActionTypes {
  LOAD_TYPES = "[Notifications] Load types",
  LOAD_TYPES_SUCCESS = "[Notifications] Load types success",

  LOAD_SETTINGS = "[Notifications] Load settings",
  LOAD_SETTINGS_SUCCESS = "[Notifications] Load settings success",

  SET_SETTING = "[Notifications] Set setting",
  SET_SETTING_SUCCESS = "[Notifications] Set setting success"
}

export class LoadNotificationTypes implements Action {
  readonly type = NotificationsActionTypes.LOAD_TYPES;
}

export class LoadNotificationTypesSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_TYPES_SUCCESS;

  constructor(public payload: { types: NotificationTypeInterface[] }) {}
}

export class LoadNotificationSettings implements Action {
  readonly type = NotificationsActionTypes.LOAD_SETTINGS;
}

export class LoadNotificationSettingsSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.LOAD_SETTINGS_SUCCESS;

  constructor(public payload: { settings: NotificationSettingInterface[] }) {}
}

export class SetNotificationSetting implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.SET_SETTING;

  constructor(public payload: { setting: NotificationSettingInterface }) {}
}

export class SetNotificationSettingSuccess implements PayloadActionInterface {
  readonly type = NotificationsActionTypes.SET_SETTING_SUCCESS;

  constructor(public payload: { setting: NotificationSettingInterface }) {}
}

export type All =
  | LoadNotificationTypes
  | LoadNotificationTypesSuccess
  | LoadNotificationSettings
  | LoadNotificationSettingsSuccess
  | SetNotificationSetting
  | SetNotificationSettingSuccess;
