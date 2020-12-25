import { createFeatureSelector, createSelector } from "@ngrx/store";
import * as fromIotd from "./iotd.reducer";
import { IotdState } from "./iotd.reducer";

export const selectIotdState = createFeatureSelector<fromIotd.IotdState>(fromIotd.iotdFeatureKey);

export const selectSubmissionQueue = createSelector(selectIotdState, (state: IotdState) => state.submissionQueue);
