// tslint:disable:max-classes-per-file

import { Action } from "@ngrx/store";

export enum SubmissionQueueActionTypes {
  LOAD_SUBMISSION_QUEUE = "[SubmissionQueue] Load SubmissionQueue",
  LOAD_SUBMISSION_QUEUE_SUCCESS = "[SubmissionQueue] Load SubmissionQueue success",
  LOAD_SUBMISSION_QUEUE_FAILURE = "[SubmissionQueue] Load SubmissionQueue failure"
}

export class LoadSubmissionQueue implements Action {
  readonly type = SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE;
}

export class LoadSubmissionQueueSuccess implements Action {
  readonly type = SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS;
  constructor(public payload: { data }) {}
}

export class LoadSubmissionQueueFailure implements Action {
  readonly type = SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE;
}

export type SubmissionQueueActions = LoadSubmissionQueue | LoadSubmissionQueueSuccess | LoadSubmissionQueueFailure;
