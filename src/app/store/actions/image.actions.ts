// tslint:disable:max-classes-per-file

import { AppActionTypes } from "@app/store/actions/app.actions";
import { Action } from "@ngrx/store";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

export class LoadImage implements Action {
  readonly type = AppActionTypes.LOAD_IMAGE;

  constructor(public payload: number | string) {}
}

export class LoadImageSuccess implements Action {
  readonly type = AppActionTypes.LOAD_IMAGE_SUCCESS;

  constructor(public payload: ImageInterface) {}
}

export class SetImage implements Action {
  readonly type = AppActionTypes.SET_IMAGE;

  constructor(public payload: ImageInterface) {}
}

export class LoadImages implements Action {
  readonly type = AppActionTypes.LOAD_IMAGES;

  constructor(public payload: number[]) {}
}

export class LoadImagesSuccess implements Action {
  readonly type = AppActionTypes.LOAD_IMAGES_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<ImageInterface>) {}
}

export class SaveImage implements Action {
  readonly type = AppActionTypes.SAVE_IMAGE;

  constructor(public payload: { image: ImageInterface }) {}
}

export class SaveImageSuccess implements Action {
  readonly type = AppActionTypes.SAVE_IMAGE_SUCCESS;

  constructor(public payload: { image: ImageInterface }) {}
}

export class SaveImageFailure implements Action {
  readonly type = AppActionTypes.SAVE_IMAGE_FAILURE;

  constructor(public payload: { image: ImageInterface }) {}
}
