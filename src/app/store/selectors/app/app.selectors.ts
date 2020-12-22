import { AppState } from "@app/store/app.states";

export const selectApp = (state: AppState) => state.app;
