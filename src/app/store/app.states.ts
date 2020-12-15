import { AppEffects } from "@app/store/effects/app.effects";
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

export const appStateEffects = [AppEffects, AuthEffects];
