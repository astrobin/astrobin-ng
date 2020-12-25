import { AppState } from "@app/store/reducers/app.reducers";
import { State } from "@app/store/state";

export const selectApp = (state: State): AppState => state.app;
