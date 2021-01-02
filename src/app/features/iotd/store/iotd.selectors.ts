import { VoteInterface } from "@features/iotd/services/review-queue-api.service";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import * as fromIotd from "./iotd.reducer";
import { IotdState, ReviewImageInterface, SubmissionImageInterface } from "./iotd.reducer";

export const selectIotdState = createFeatureSelector<fromIotd.IotdState>(fromIotd.iotdFeatureKey);

export const selectSubmissionQueue = createSelector(
  selectIotdState,
  (state: IotdState): PaginatedApiResultInterface<SubmissionImageInterface> => state.submissionQueue
);

export const selectHiddenSubmissionEntries = createSelector(
  selectIotdState,
  (state: IotdState): number[] => state.hiddenSubmissionEntries
);

export const selectSubmissions = createSelector(
  selectIotdState,
  (state: IotdState): SubmissionInterface[] => state.submissions
);

export const selectSubmissionForImage = createSelector(
  selectSubmissions,
  (submissions: SubmissionInterface[], imageId: number): SubmissionInterface => {
    const matching = submissions.filter(submission => submission.image === imageId);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);

export const selectReviewQueue = createSelector(
  selectIotdState,
  (state: IotdState): PaginatedApiResultInterface<ReviewImageInterface> => state.reviewQueue
);

export const selectHiddenReviewEntries = createSelector(
  selectIotdState,
  (state: IotdState): number[] => state.hiddenReviewEntries
);

export const selectReviews = createSelector(selectIotdState, (state: IotdState): VoteInterface[] => state.votes);

export const selectReviewForImage = createSelector(
  selectReviews,
  (reviews: VoteInterface[], imageId: number): VoteInterface => {
    const matching = reviews.filter(review => review.image === imageId);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);
