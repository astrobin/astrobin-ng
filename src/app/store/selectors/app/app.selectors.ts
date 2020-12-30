import { AppState } from "@app/store/reducers/app.reducers";
import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";

export const selectApp = (state: State): AppState => state.app;

export const selectIotdMaxSubmissionsPerDay = createSelector(
  selectApp,
  (state: AppState): number => state.backendConfig.IOTD_SUBMISSION_MAX_PER_DAY
);
