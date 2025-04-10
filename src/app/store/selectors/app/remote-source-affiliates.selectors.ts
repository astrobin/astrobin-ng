import type { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { createSelector } from "@ngrx/store";

export const selectRemoteSourceAffiliates = createSelector(
  selectApp,
  (state: AppState) => state.remoteSourceAffiliates
);
