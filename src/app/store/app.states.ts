import * as auth from "@features/account/store/auth.reducers";
import * as app from "./reducers/app.reducers";

export interface AppState {
  app: app.State;
  auth: auth.State;
}

export const reducers = {
  app: app.reducer,
  auth: auth.reducer
};
