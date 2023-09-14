/* eslint-disable max-classes-per-file */

import {
  DismissedImage,
  HiddenImage,
  IotdInterface,
  SubmissionInterface,
  VoteInterface
} from "@features/iotd/services/iotd-api.service";
import { Action } from "@ngrx/store";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { StaffMemberSettingsInterface } from "@features/iotd/types/staff-member-settings.interface";
import { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";

export enum IotdActionTypes {
  // Generic

  LOAD_STAFF_MEMBER_SETTINGS = "[IOTD] Load staff member settings",
  LOAD_STAFF_MEMBER_SETTINGS_SUCCESS = "[IOTD] Load staff member settings success",

  LOAD_HIDDEN_IMAGES = "[IOTD] Load hidden images",
  LOAD_HIDDEN_IMAGES_SUCCESS = "[IOTD] Load hidden images success",
  HIDE_IMAGE = "[IOTD] Hide image",
  HIDE_IMAGE_SUCCESS = "[IOTD] Hide image success",
  SHOW_IMAGE = "[IOTD] Show image",
  SHOW_IMAGE_SUCCESS = "[IOTD] Show image success",

  LOAD_DISMISSED_IMAGES = "[IOTD] Load dismissed images",
  LOAD_DISMISSED_IMAGES_SUCCESS = "[IOTD] Load dismissed images success",
  DISMISS_IMAGE = "[IOTD] Dismiss image",
  DISMISS_IMAGE_SUCCESS = "[IOTD] Dismiss image success",

  // Submissions

  LOAD_SUBMISSION_QUEUE = "[IOTD] Load Submission queue",
  LOAD_SUBMISSION_QUEUE_SUCCESS = "[IOTD] Load Submission queue success",
  LOAD_SUBMISSION_QUEUE_FAILURE = "[IOTD] Load Submission queue failure",

  CLEAR_SUBMISSION_QUEUE = "[IOTD] Clear Submission queue",

  LOAD_SUBMISSIONS = "[IOTD] Load submissions",
  LOAD_SUBMISSIONS_SUCCESS = "[IOTD] Load submissions success",
  LOAD_SUBMISSIONS_FAILURE = "[IOTD] Load submissions failure",

  POST_SUBMISSION = "[IOTD] Post submission",
  POST_SUBMISSION_SUCCESS = "[IOTD] Post submission success",
  POST_SUBMISSION_FAILURE = "[IOTD] Post submission failure",

  DELETE_SUBMISSION = "[IOTD] Delete submission",
  DELETE_SUBMISSION_SUCCESS = "[IOTD] Delete submission success",
  DELETE_SUBMISSION_FAILURE = "[IOTD] Delete submission failure",

  // Reviews

  LOAD_REVIEW_QUEUE = "[IOTD] Load Review queue",
  LOAD_REVIEW_QUEUE_SUCCESS = "[IOTD] Load Review queue success",
  LOAD_REVIEW_QUEUE_FAILURE = "[IOTD] Load Review queue failure",

  CLEAR_REVIEW_QUEUE = "[IOTD] Clear Review queue",

  LOAD_VOTES = "[IOTD] Load reviews",
  LOAD_VOTES_SUCCESS = "[IOTD] Load reviews success",
  LOAD_VOTES_FAILURE = "[IOTD] Load reviews failure",

  POST_VOTE = "[IOTD] Post review",
  POST_VOTE_SUCCESS = "[IOTD] Post review success",
  POST_VOTE_FAILURE = "[IOTD] Post review failure",

  DELETE_VOTE = "[IOTD] Delete review",
  DELETE_VOTE_SUCCESS = "[IOTD] Delete review success",
  DELETE_VOTE_FAILURE = "[IOTD] Delete review failure",

  // Judgement

  LOAD_JUDGEMENT_QUEUE = "[IOTD] Load Judgement queue",
  LOAD_JUDGEMENT_QUEUE_SUCCESS = "[IOTD] Load Judgement queue success",
  LOAD_JUDGEMENT_QUEUE_FAILURE = "[IOTD] Load Judgement queue failure",

  CLEAR_JUDGEMENT_QUEUE = "[IOTD] Clear Judgement queue",

  LOAD_FUTURE_IOTDS = "[IOTD] Load future IOTDs",
  LOAD_FUTURE_IOTDS_SUCCESS = "[IOTD] Load future IOTDs success",
  LOAD_FUTURE_IOTDS_FAILURE = "[IOTD] Load future IOTDs failure",

  POST_IOTD = "[IOTD] Post IOTD",
  POST_IOTD_SUCCESS = "[IOTD] Post IOTD success",
  POST_IOTD_FAILURE = "[IOTD] Post IOTD failure",

  DELETE_IOTD = "[IOTD] Delete IOTD",
  DELETE_IOTD_SUCCESS = "[IOTD] Delete IOTD success",
  DELETE_IOTD_FAILURE = "[IOTD] Delete IOTD failure"
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GENERIC
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class LoadStaffMemberSettings implements Action {
  readonly type = IotdActionTypes.LOAD_STAFF_MEMBER_SETTINGS;
}

export class LoadStaffMemberSettingsSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_STAFF_MEMBER_SETTINGS_SUCCESS;

  constructor(public payload: { settings: StaffMemberSettingsInterface }) {
  }
}

export class LoadHiddenImages implements Action {
  readonly type = IotdActionTypes.LOAD_HIDDEN_IMAGES;
}

export class LoadHiddenImagesSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_HIDDEN_IMAGES_SUCCESS;

  constructor(public payload: { hiddenImages: HiddenImage[] }) {
  }
}

export class HideImage implements PayloadActionInterface {
  readonly type = IotdActionTypes.HIDE_IMAGE;

  constructor(public payload: { id: number }) {
  }
}

export class HideImageSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.HIDE_IMAGE_SUCCESS;

  constructor(public payload: { hiddenImage: HiddenImage }) {
  }
}

export class ShowImage implements PayloadActionInterface {
  readonly type = IotdActionTypes.SHOW_IMAGE;

  constructor(public payload: { hiddenImage: HiddenImage }) {
  }
}

export class ShowImageSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.SHOW_IMAGE_SUCCESS;

  constructor(public payload: { id: number }) {
  }
}

export class LoadDismissedImages implements Action {
  readonly type = IotdActionTypes.LOAD_DISMISSED_IMAGES;
}

export class LoadDismissedImagesSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_DISMISSED_IMAGES_SUCCESS;

  constructor(public payload: { dismissedImages: DismissedImage[] }) {
  }
}

export class DismissImage implements PayloadActionInterface {
  readonly type = IotdActionTypes.DISMISS_IMAGE;

  constructor(public payload: { id: number }) {
  }
}

export class DismissImageSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.DISMISS_IMAGE_SUCCESS;

  constructor(public payload: { dismissedImage: DismissedImage }) {
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SUBMISSIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class LoadSubmissionQueue implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE;

  constructor(
    public payload: { page: number; sort: "newest" | "oldest" | "default" } = {
      page: 1,
      sort: "default"
    }
  ) {
  }
}

export class LoadSubmissionQueueSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<SubmissionImageInterface>) {
  }
}

export class LoadSubmissionQueueFailure implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE;
}

export class ClearSubmissionQueue implements Action {
  readonly type = IotdActionTypes.CLEAR_SUBMISSION_QUEUE;
}

export class LoadSubmissions implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSIONS;
}

export class LoadSubmissionsSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_SUBMISSIONS_SUCCESS;

  constructor(public payload: SubmissionInterface[]) {
  }
}

export class LoadSubmissionsFailure implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSIONS_FAILURE;
}

export class PostSubmission implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_SUBMISSION;

  constructor(public payload: { imageId: number }) {
  }
}

export class PostSubmissionSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_SUBMISSION_SUCCESS;

  constructor(public payload: SubmissionInterface) {
  }
}

export class PostSubmissionFailure implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_SUBMISSION_FAILURE;

  constructor(public payload: any) {
  }
}

export class DeleteSubmission implements PayloadActionInterface {
  readonly type = IotdActionTypes.DELETE_SUBMISSION;

  constructor(public payload: { id: number }) {
  }
}

export class DeleteSubmissionSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.DELETE_SUBMISSION_SUCCESS;

  constructor(public payload: { id: number }) {
  }
}

export class DeleteSubmissionFailure implements Action {
  readonly type = IotdActionTypes.DELETE_SUBMISSION_FAILURE;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REVIEWS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class LoadReviewQueue implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_REVIEW_QUEUE;

  constructor(
    public payload: { page: number; sort?: "newest" | "oldest" | "default" } = {
      page: 1,
      sort: "default"
    }
  ) {
  }
}

export class LoadReviewQueueSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_REVIEW_QUEUE_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<ReviewImageInterface>) {
  }
}

export class LoadReviewQueueFailure implements Action {
  readonly type = IotdActionTypes.LOAD_REVIEW_QUEUE_FAILURE;
}

export class ClearReviewQueue implements Action {
  readonly type = IotdActionTypes.CLEAR_REVIEW_QUEUE;
}

export class LoadVotes implements Action {
  readonly type = IotdActionTypes.LOAD_VOTES;
}

export class LoadVotesSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_VOTES_SUCCESS;

  constructor(public payload: VoteInterface[]) {
  }
}

export class LoadVotesFailure implements Action {
  readonly type = IotdActionTypes.LOAD_VOTES_FAILURE;
}

export class PostVote implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_VOTE;

  constructor(public payload: { imageId: number }) {
  }
}

export class PostVoteSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_VOTE_SUCCESS;

  constructor(public payload: VoteInterface) {
  }
}

export class PostVoteFailure implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_VOTE_FAILURE;

  constructor(public payload: any) {
  }
}

export class DeleteVote implements PayloadActionInterface {
  readonly type = IotdActionTypes.DELETE_VOTE;

  constructor(public payload: { id: number }) {
  }
}

export class DeleteVoteSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.DELETE_VOTE_SUCCESS;

  constructor(public payload: { id: number }) {
  }
}

export class DeleteVoteFailure implements Action {
  readonly type = IotdActionTypes.DELETE_VOTE_FAILURE;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JUDGEMENT
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class LoadJudgementQueue implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_JUDGEMENT_QUEUE;

  constructor(
    public payload: { page: number; sort?: "newest" | "oldest" | "default" } = {
      page: 1,
      sort: "default"
    }
  ) {
  }
}

export class LoadJudgementQueueSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_JUDGEMENT_QUEUE_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<JudgementImageInterface>) {
  }
}

export class LoadJudgementQueueFailure implements Action {
  readonly type = IotdActionTypes.LOAD_JUDGEMENT_QUEUE_FAILURE;
}

export class ClearJudgementQueue implements Action {
  readonly type = IotdActionTypes.CLEAR_JUDGEMENT_QUEUE;
}

export class LoadFutureIods implements Action {
  readonly type = IotdActionTypes.LOAD_FUTURE_IOTDS;
}

export class LoadFutureIodsSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.LOAD_FUTURE_IOTDS_SUCCESS;

  constructor(public payload: { futureIotds: IotdInterface[] }) {
  }
}

export class LoadFutureIodsFailure implements Action {
  readonly type = IotdActionTypes.LOAD_FUTURE_IOTDS_FAILURE;
}

export class PostIotd implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_IOTD;

  constructor(public payload: { imageId: number }) {
  }
}

export class PostIotdSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_IOTD_SUCCESS;

  constructor(public payload: IotdInterface) {
  }
}

export class PostIotdFailure implements PayloadActionInterface {
  readonly type = IotdActionTypes.POST_IOTD_FAILURE;

  constructor(public payload: any) {
  }
}

export class DeleteIotd implements PayloadActionInterface {
  readonly type = IotdActionTypes.DELETE_IOTD;

  constructor(public payload: { id: number }) {
  }
}

export class DeleteIotdSuccess implements PayloadActionInterface {
  readonly type = IotdActionTypes.DELETE_IOTD_SUCCESS;

  constructor(public payload: { id: number }) {
  }
}

export class DeleteIotdFailure implements Action {
  readonly type = IotdActionTypes.DELETE_IOTD_FAILURE;
}

export type IotdActions =
// Generic
  | LoadStaffMemberSettings
  | LoadStaffMemberSettingsSuccess
  | LoadHiddenImages
  | LoadHiddenImagesSuccess
  | HideImage
  | HideImageSuccess
  | ShowImage
  | ShowImageSuccess
  | LoadDismissedImages
  | LoadDismissedImagesSuccess
  | DismissImage
  | DismissImageSuccess

  // Submissions
  | LoadSubmissionQueue
  | LoadSubmissionQueueSuccess
  | LoadSubmissionQueueFailure
  | ClearSubmissionQueue
  | LoadSubmissions
  | LoadSubmissionsSuccess
  | LoadSubmissionsFailure
  | PostSubmission
  | PostSubmissionSuccess
  | PostSubmissionFailure
  | DeleteSubmission
  | DeleteSubmissionSuccess
  | DeleteSubmissionFailure

  // Reviews
  | LoadReviewQueue
  | LoadReviewQueueSuccess
  | LoadReviewQueueFailure
  | ClearReviewQueue
  | LoadVotes
  | LoadVotesSuccess
  | LoadVotesFailure
  | PostVote
  | PostVoteSuccess
  | PostVoteFailure
  | DeleteVote
  | DeleteVoteSuccess
  | DeleteVoteFailure

  // Judgement
  | LoadJudgementQueue
  | LoadJudgementQueueSuccess
  | LoadJudgementQueueFailure
  | ClearJudgementQueue
  | LoadFutureIods
  | LoadFutureIodsSuccess
  | LoadFutureIodsFailure
  | PostIotd
  | PostIotdSuccess
  | PostIotdFailure
  | DeleteIotd
  | DeleteIotdSuccess
  | DeleteIotdFailure;
