// tslint:disable:max-classes-per-file

import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
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
  DELETE_SUBMISSION_FAILURE = "[IOTD Submission queue] Delete submission failure"
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
  | DeleteSubmissionFailure;
