// tslint:disable:max-classes-per-file

import { Action } from "@ngrx/store";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

export enum IotdActionTypes {
  LOAD_SUBMISSION_QUEUE = "[SubmissionQueue] Load SubmissionQueue",
  LOAD_SUBMISSION_QUEUE_SUCCESS = "[SubmissionQueue] Load SubmissionQueue success",
  LOAD_SUBMISSION_QUEUE_FAILURE = "[SubmissionQueue] Load SubmissionQueue failure"
}

export class LoadSubmissionQueue implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE;

  constructor(public payload: { page: number } = { page: 1 }) {}
}

export class LoadSubmissionQueueSuccess implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<ImageInterface>) {}
}

export class LoadSubmissionQueueFailure implements Action {
  readonly type = IotdActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE;
}

export type IotdActions = LoadSubmissionQueue | LoadSubmissionQueueSuccess | LoadSubmissionQueueFailure;
