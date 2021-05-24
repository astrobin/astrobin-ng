import { CameraEffects } from "@app/store/effects/camera.effects";
import { ContentTypeEffects } from "@app/store/effects/content-type.effects";
import { FullscreenImageEffects } from "@app/store/effects/fullscreen-image.effects";
import { ImageEffects } from "@app/store/effects/image.effects";
import { InitializeAppEffects } from "@app/store/effects/initialize-app.effects";
import { SolutionEffects } from "@app/store/effects/solution.effects";
import { TelescopeEffects } from "@app/store/effects/telescope.effects";
import { ThumbnailEffects } from "@app/store/effects/thumbnail.effects";
import { AuthEffects } from "@features/account/store/auth.effects";
import * as auth from "@features/account/store/auth.reducers";
import { initialAuthState } from "@features/account/store/auth.reducers";
import * as notifications from "@features/notifications/store/notifications.reducers";
import { initialNotificationsState } from "@features/notifications/store/notifications.reducers";
import * as app from "./reducers/app.reducers";
import { initialAppState } from "./reducers/app.reducers";
import { LocationEffects } from "@app/store/effects/location.effects";
import { NotificationsEffects } from "@features/notifications/store/notifications.effects";

export interface State {
  app: app.AppState;
  auth: auth.AuthState;
  notifications: notifications.NotificationsState;
}

export const initialState: State = {
  app: initialAppState,
  auth: initialAuthState,
  notifications: initialNotificationsState
};

export const appStateReducers = {
  app: app.reducer,
  auth: auth.reducer,
  notifications: notifications.reducer
};

export const appStateEffects = [
  AuthEffects,
  CameraEffects,
  ContentTypeEffects,
  FullscreenImageEffects,
  InitializeAppEffects,
  ImageEffects,
  LocationEffects,
  NotificationsEffects,
  SolutionEffects,
  ThumbnailEffects,
  TelescopeEffects
];
