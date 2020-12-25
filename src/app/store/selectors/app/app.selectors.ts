import { AppState } from "@app/store/app.states";
import { State } from "@app/store/reducers/app.reducers";

export const selectApp = (state: AppState): State => state.app;
