import { createSelector } from "@ngrx/store";
import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";

export const selectRemoteSourceAffiliates = createSelector(
  selectApp,
  (state: AppState) => state.remoteSourceAffiliates
);
