import { createFeatureSelector, createSelector } from "@ngrx/store";
import * as fromSubmissionQueue from "./submission-queue.reducer";
import { State } from "./submission-queue.reducer";

export const selectSubmissionQueueState = createFeatureSelector<fromSubmissionQueue.State>(
  fromSubmissionQueue.submissionQueueFeatureKey
);

export const selectSubmissionQueue = createSelector(selectSubmissionQueueState, (state: State) => state);
