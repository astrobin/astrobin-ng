// tslint:disable:max-classes-per-file

import { Action } from "@ngrx/store";

export enum SubmissionQueueActionTypes {
  LOAD_SUBMISSION_QUEUE = "[SubmissionQueue] Load SubmissionQueue",
  LOAD_SUBMISSION_QUEUE_SUCCESS = "[SubmissionQueue] Load SubmissionQueue Success"
}

export class LoadSubmissionQueue implements Action {
  readonly type = SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE;
}

export class LoadSubmissionQueueSuccess implements Action {
  readonly type = SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS;
  constructor(public payload: { data }) {}
}

export type SubmissionQueueActions = LoadSubmissionQueue | LoadSubmissionQueueSuccess;
