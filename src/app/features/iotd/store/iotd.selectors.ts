import {
  DismissedImage,
  HiddenImage,
  IotdInterface,
  ReviewerSeenImage,
  SubmissionInterface,
  SubmitterSeenImage,
  VoteInterface
} from "@features/iotd/services/iotd-api.service";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import * as fromIotd from "./iotd.reducer";
import { IotdState } from "./iotd.reducer";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { StaffMemberSettingsInterface } from "@features/iotd/types/staff-member-settings.interface";
import { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";

export const selectIotdState = createFeatureSelector<fromIotd.IotdState>(fromIotd.iotdFeatureKey);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GENERIC
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const selectStaffMemberSettings = createSelector(
  selectIotdState,
  (state: IotdState): StaffMemberSettingsInterface => state.staffMemberSettings
);

export const selectHiddenImages = createSelector(
  selectIotdState,
  (state: IotdState): HiddenImage[] => state.hiddenImages
);

export const selectSubmitterSeenImages = createSelector(
  selectIotdState,
  (state: IotdState): SubmitterSeenImage[] => state.submitterSeenImages
);

export const selectReviewerSeenImages = createSelector(
  selectIotdState,
  (state: IotdState): ReviewerSeenImage[] => state.reviewerSeenImages
);

export const selectHiddenImageByImageId = createSelector(
  selectHiddenImages,
  (hiddenImages: HiddenImage[], imageId: number): HiddenImage => {
    const matching = hiddenImages.filter(hiddenImage => hiddenImage.image === imageId);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);

export const selectDismissedImages = createSelector(
  selectIotdState,
  (state: IotdState): DismissedImage[] => state.dismissedImages
);

export const selectDismissedImageByImageId = createSelector(
  selectDismissedImages,
  (dismissedImages: DismissedImage[], imageId: number): DismissedImage => {
    const matching = dismissedImages.filter(dismissedImage => dismissedImage.image === imageId);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SUBMISSIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const selectSubmissionQueue = createSelector(
  selectIotdState,
  (state: IotdState): PaginatedApiResultInterface<SubmissionImageInterface> => state.submissionQueue
);

export const selectSubmissionQueueEntry = createSelector(
  selectSubmissionQueue,
  (
    queue: PaginatedApiResultInterface<SubmissionImageInterface>,
    pk: SubmissionImageInterface["pk"]
  ): SubmissionImageInterface => {
    const matching = queue.results.filter(entry => entry.pk === pk);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REVIEWS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const selectReviewQueue = createSelector(
  selectIotdState,
  (state: IotdState): PaginatedApiResultInterface<ReviewImageInterface> => state.reviewQueue
);

export const selectReviewQueueEntry = createSelector(
  selectReviewQueue,
  (queue: PaginatedApiResultInterface<ReviewImageInterface>, pk: ReviewImageInterface["pk"]): ReviewImageInterface => {
    const matching = queue.results.filter(entry => entry.pk === pk);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JUDGEMENT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const selectJudgementQueue = createSelector(
  selectIotdState,
  (state: IotdState): PaginatedApiResultInterface<JudgementImageInterface> => state.judgementQueue
);

export const selectJudgementQueueEntry = createSelector(
  selectJudgementQueue,
  (
    queue: PaginatedApiResultInterface<JudgementImageInterface>,
    pk: JudgementImageInterface["pk"]
  ): JudgementImageInterface => {
    const matching = queue.results.filter(entry => entry.pk === pk);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);

export const selectFutureIotds = createSelector(
  selectIotdState,
  (state: IotdState): IotdInterface[] => state.futureIotds
);

export const selectFutureIotd = createSelector(
  selectFutureIotds,
  (futureIotds: IotdInterface[], id: number): IotdInterface => {
    const matching = futureIotds.filter(iotd => iotd.id === id);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);

export const selectFutureIotdForImage = createSelector(
  selectFutureIotds,
  (futureIotds: IotdInterface[], imageId: number): IotdInterface => {
    const matching = futureIotds.filter(iotd => iotd.image === imageId);
    if (matching.length === 1) {
      return matching[0];
    }

    return null;
  }
);
