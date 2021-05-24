import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";
import { NotificationsState } from "@features/notifications/store/notifications.reducers";

export const selectNotifications = (state: State): NotificationsState => state.notifications;
export const selectNotificationTypes = createSelector(selectNotifications, state => state.types);
export const selectNotificationSettings = createSelector(selectNotifications, state => state.settings);
