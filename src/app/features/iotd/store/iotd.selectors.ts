import { createFeatureSelector, createSelector } from "@ngrx/store";
import * as fromIotd from "./iotd.reducer";
import { State } from "./iotd.reducer";

export const selectIotdState = createFeatureSelector<fromIotd.State>(fromIotd.iotdFeatureKey);

export const selectSubmissionQueue = createSelector(selectIotdState, (state: State) => state.submissionQueue);
