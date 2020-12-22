import { CameraEffects } from "@app/store/effects/camera.effects";
import { ImageEffects } from "@app/store/effects/image.effects";
import { InitializeAppEffects } from "@app/store/effects/initialize-app.effects";
import { TelescopeEffects } from "@app/store/effects/telescope.effects";
import { AuthEffects } from "@features/account/store/auth.effects";
import * as auth from "@features/account/store/auth.reducers";
import * as app from "./reducers/app.reducers";

export interface AppState {
  app: app.State;
  auth: auth.State;
}

export const appStateReducers = {
  app: app.reducer,
  auth: auth.reducer
};

export const appStateEffects = [InitializeAppEffects, ImageEffects, TelescopeEffects, CameraEffects, AuthEffects];
