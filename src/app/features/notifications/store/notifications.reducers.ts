import { NotificationSettingInterface } from "@features/notifications/interfaces/notification-setting.interface";
import { NotificationTypeInterface } from "@features/notifications/interfaces/notification-type.interface";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import { All, NotificationsActionTypes } from "@features/notifications/store/notifications.actions";

export interface NotificationsState {
  types: NotificationTypeInterface[] | null;
  settings: NotificationSettingInterface[] | null;
  notifications: NotificationInterface[] | null;
  totalNotifications: number | null;
  unreadCount: number | null;
}

export const initialNotificationsState: NotificationsState = {
  types: null,
  settings: null,
  notifications: null,
  totalNotifications: null,
  unreadCount: null
};

export function notificationsReducer(state = initialNotificationsState, action: All): NotificationsState {
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
    case NotificationsActionTypes.LOAD_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications,
        totalNotifications: action.payload.total
      };
    case NotificationsActionTypes.GET_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        unreadCount: action.payload.count
      };
    case NotificationsActionTypes.MARK_AS_READ_SUCCESS:
      return {
        ...state,
        unreadCount: Math.max(0, state.unreadCount - (action.payload.read ? 1 : -1)),
        notifications: state.notifications.map(notification => {
          if (notification.id === action.payload.notificationId) {
            return {
              ...notification,
              read: action.payload.read
            };
          }

          return notification;
        })
      };
    case NotificationsActionTypes.MARK_ALL_AS_READ_SUCCESS:
      return {
        ...state,
        unreadCount: 0,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        }))
      };
    default:
      return state;
  }
}
