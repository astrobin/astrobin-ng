// tslint:disable:max-classes-per-file

import { VoteInterface } from "@features/iotd/services/review-queue-api.service";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { ReviewImageInterface, SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import { Action } from "@ngrx/store";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

export enum IotdActionTypes {
  LOAD_SUBMISSION_QUEUE = "[IOTD Submission queue] Load Submission queue",
  LOAD_SUBMISSION_QUEUE_SUCCESS = "[IOTD Submission queue] Load Submission queue success",
  LOAD_SUBMISSION_QUEUE_FAILURE = "[IOTD Submission queue] Load Submission queue failure",

  LOAD_SUBMISSIONS = "[IOTD Submission queue] Load submissions",
  LOAD_SUBMISSIONS_SUCCESS = "[IOTD Submission queue] Load submissions success",
  LOAD_SUBMISSIONS_FAILURE = "[IOTD Submission queue] Load submissions failure",

  POST_SUBMISSION = "[IOTD Submission queue] Post submission",
  POST_SUBMISSION_SUCCESS = "[IOTD Submission queue] Post submission success",
  POST_SUBMISSION_FAILURE = "[IOTD Submission queue] Post submission failure",

  DELETE_SUBMISSION = "[IOTD Submission queue] Delete submission",
  DELETE_SUBMISSION_SUCCESS = "[IOTD Submission queue] Delete submission success",
  DELETE_SUBMISSION_FAILURE = "[IOTD Submission queue] Delete submission failure",

  INIT_HIDDEN_SUBMISSION_ENTRIES = "[IOTD Submission queue] Init hidden submissions",
  INIT_HIDDEN_SUBMISSION_ENTRIES_SUCCESS = "[IOTD Submission queue] Init hidden submissions success",
  HIDE_SUBMISSION_ENTRY = "[IOTD Submission queue] Hide submission",

  LOAD_REVIEW_QUEUE = "[IOTD Review queue] Load Review queue",
  LOAD_REVIEW_QUEUE_SUCCESS = "[IOTD Review queue] Load Review queue success",
  LOAD_REVIEW_QUEUE_FAILURE = "[IOTD Review queue] Load Review queue failure",

  LOAD_VOTES = "[IOTD Review queue] Load reviews",
  LOAD_VOTES_SUCCESS = "[IOTD Review queue] Load reviews success",
  LOAD_VOTES_FAILURE = "[IOTD Review queue] Load reviews failure",

  POST_VOTE = "[IOTD Review queue] Post review",
  POST_VOTE_SUCCESS = "[IOTD Review queue] Post review success",
  POST_VOTE_FAILURE = "[IOTD Review queue] Post review failure",

  DELETE_VOTE = "[IOTD Review queue] Delete review",
  DELETE_VOTE_SUCCESS = "[IOTD Review queue] Delete review success",
  DELETE_VOTE_FAILURE = "[IOTD Review queue] Delete review failure",

  INIT_HIDDEN_REVIEW_ENTRIES = "[IOTD Review queue] Init hidden reviews",
  INIT_HIDDEN_REVIEW_ENTRIES_SUCCESS = "[IOTD Review queue] Init hidden reviews success",
  HIDE_REVIEW_ENTRY = "[IOTD Review queue] Hide review"
}

export class LoadSubmissionQueue implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE;

  constructor(public payload: { page: number } = { page: 1 }) {}
}

export class LoadSubmissionQueueSuccess implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<SubmissionImageInterface>) {}
}

export class LoadSubmissionQueueFailure implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE;
}

export class LoadSubmissions implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSIONS;
}

export class LoadSubmissionsSuccess implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSIONS_SUCCESS;

  constructor(public payload: SubmissionInterface[]) {}
}

export class LoadSubmissionsFailure implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSIONS_FAILURE;
}

export class PostSubmission implements Action {
  readonly type = IotdActionTypes.POST_SUBMISSION;

  constructor(public payload: { imageId: number }) {}
}

export class PostSubmissionSuccess implements Action {
  readonly type = IotdActionTypes.POST_SUBMISSION_SUCCESS;

  constructor(public payload: SubmissionInterface) {}
}

export class PostSubmissionFailure implements Action {
  readonly type = IotdActionTypes.POST_SUBMISSION_FAILURE;
  constructor(public payload: any) {}
}

export class DeleteSubmission implements Action {
  readonly type = IotdActionTypes.DELETE_SUBMISSION;

  constructor(public payload: { id: number }) {}
}

export class DeleteSubmissionSuccess implements Action {
  readonly type = IotdActionTypes.DELETE_SUBMISSION_SUCCESS;

  constructor(public payload: { id: number }) {}
}

export class DeleteSubmissionFailure implements Action {
  readonly type = IotdActionTypes.DELETE_SUBMISSION_FAILURE;
}

export class InitHiddenSubmissionEntries implements Action {
  readonly type = IotdActionTypes.INIT_HIDDEN_SUBMISSION_ENTRIES;
}

export class InitHiddenSubmissionEntriesSuccess implements Action {
  readonly type = IotdActionTypes.INIT_HIDDEN_SUBMISSION_ENTRIES_SUCCESS;

  constructor(public payload: { ids: number[] }) {}
}

export class HideSubmissionEntry implements Action {
  readonly type = IotdActionTypes.HIDE_SUBMISSION_ENTRY;

  constructor(public payload: { id: number }) {}
}

export class LoadReviewQueue implements Action {
  readonly type = IotdActionTypes.LOAD_REVIEW_QUEUE;

  constructor(public payload: { page: number } = { page: 1 }) {}
}

export class LoadReviewQueueSuccess implements Action {
  readonly type = IotdActionTypes.LOAD_REVIEW_QUEUE_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<ReviewImageInterface>) {}
}

export class LoadReviewQueueFailure implements Action {
  readonly type = IotdActionTypes.LOAD_REVIEW_QUEUE_FAILURE;
}

export class LoadVotes implements Action {
  readonly type = IotdActionTypes.LOAD_VOTES;
}

export class LoadVotesSuccess implements Action {
  readonly type = IotdActionTypes.LOAD_VOTES_SUCCESS;

  constructor(public payload: VoteInterface[]) {}
}

export class LoadVotesFailure implements Action {
  readonly type = IotdActionTypes.LOAD_VOTES_FAILURE;
}

export class PostVote implements Action {
  readonly type = IotdActionTypes.POST_VOTE;

  constructor(public payload: { imageId: number }) {}
}

export class PostVoteSuccess implements Action {
  readonly type = IotdActionTypes.POST_VOTE_SUCCESS;

  constructor(public payload: VoteInterface) {}
}

export class PostVoteFailure implements Action {
  readonly type = IotdActionTypes.POST_VOTE_FAILURE;
  constructor(public payload: any) {}
}

export class DeleteVote implements Action {
  readonly type = IotdActionTypes.DELETE_VOTE;

  constructor(public payload: { id: number }) {}
}

export class DeleteVoteSuccess implements Action {
  readonly type = IotdActionTypes.DELETE_VOTE_SUCCESS;

  constructor(public payload: { id: number }) {}
}

export class DeleteVoteFailure implements Action {
  readonly type = IotdActionTypes.DELETE_VOTE_FAILURE;
}

export class InitHiddenReviewEntries implements Action {
  readonly type = IotdActionTypes.INIT_HIDDEN_REVIEW_ENTRIES;
}

export class InitHiddenReviewEntriesSuccess implements Action {
  readonly type = IotdActionTypes.INIT_HIDDEN_REVIEW_ENTRIES_SUCCESS;

  constructor(public payload: { ids: number[] }) {}
}

export class HideReviewEntry implements Action {
  readonly type = IotdActionTypes.HIDE_REVIEW_ENTRY;

  constructor(public payload: { id: number }) {}
}

export type IotdActions =
  | LoadSubmissionQueue
  | LoadSubmissionQueueSuccess
  | LoadSubmissionQueueFailure
  | LoadSubmissions
  | LoadSubmissionsSuccess
  | LoadSubmissionsFailure
  | PostSubmission
  | PostSubmissionSuccess
  | PostSubmissionFailure
  | DeleteSubmission
  | DeleteSubmissionSuccess
  | DeleteSubmissionFailure
  | InitHiddenSubmissionEntries
  | InitHiddenSubmissionEntriesSuccess
  | HideSubmissionEntry
  | LoadReviewQueue
  | LoadReviewQueueSuccess
  | LoadReviewQueueFailure
  | LoadVotes
  | LoadVotesSuccess
  | LoadVotesFailure
  | PostVote
  | PostVoteSuccess
  | PostVoteFailure
  | DeleteVote
  | DeleteVoteSuccess
  | DeleteVoteFailure
  | InitHiddenReviewEntries
  | InitHiddenReviewEntriesSuccess
  | HideReviewEntry;
