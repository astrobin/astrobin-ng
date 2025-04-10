import { AppState } from "@app/store/reducers/app.reducers";
import { MainState } from "@app/store/state";
import { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import { createSelector } from "@ngrx/store";

export const selectApp = (state: MainState): AppState => state.app;

export const selectBreadcrumb = createSelector(selectApp, state => state.breadcrumb);

export const selectBackendConfig = createSelector(selectApp, (state): BackendConfigInterface => state.backendConfig);

export const selectRequestCountry = createSelector(selectApp, (state): string => state.requestCountry);

export const selectIotdMaxSubmissionsPerDay = createSelector(
  selectBackendConfig,
  (backendConfig): number => backendConfig.IOTD_SUBMISSION_MAX_PER_DAY
);

export const selectIotdMaxReviewsPerDay = createSelector(
  selectBackendConfig,
  (backendConfig): number => backendConfig.IOTD_REVIEW_MAX_PER_DAY
);

export const selectIotdMaxFutureIotds = createSelector(
  selectBackendConfig,
  (backendConfig): number => backendConfig.IOTD_JUDGEMENT_MAX_FUTURE_DAYS
);

export const selectCurrentFullscreenImage = createSelector(selectApp, state => state.currentFullscreenImage);

export const selectCurrentFullscreenImageEvent = createSelector(selectApp, state => state.currentFullscreenImageEvent);
