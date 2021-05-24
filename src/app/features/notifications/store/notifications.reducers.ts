import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";
import { All, NotificationsActionTypes } from "@features/notifications/store/notifications.actions";

export interface NotificationsState {
  types: NotificationTypeInterface[] | null;
  settings: NotificationSettingInterface[] | null;
}

export const initialNotificationsState: NotificationsState = {
  types: null,
  settings: null
};

export function reducer(state = initialNotificationsState, action: All): NotificationsState {
  switch (action.type) {
    case NotificationsActionTypes.LOAD_TYPES_SUCCESS:
      return {
        ...state,
        types: action.payload.types
      };
    case NotificationsActionTypes.LOAD_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: action.payload.settings
      };
    case NotificationsActionTypes.SET_SETTING_SUCCESS:
      return {
        ...state,
        settings: state.settings.map(setting => {
          if (setting.id === action.payload.setting.id) {
            return action.payload.setting;
          }

          return setting;
        })
      };
    default:
      return state;
  }
}
