import type { MainState } from "@app/store/state";
import type { NotificationsState } from "@features/notifications/store/notifications.reducers";
import { createSelector } from "@ngrx/store";

export const selectNotifications = (state: MainState): NotificationsState => state.notifications;
export const selectNotificationTypes = createSelector(selectNotifications, state => state.types);
export const selectNotificationSettings = createSelector(selectNotifications, state => state.settings);
export const selectUnreadNotificationsCount = createSelector(selectNotifications, state => state.unreadCount);
