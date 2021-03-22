// tslint:disable:max-classes-per-file

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

export class LoadImage implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE;

  constructor(public payload: number | string) {}
}

export class LoadImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE_SUCCESS;

  constructor(public payload: ImageInterface) {}
}

export class SetImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_IMAGE;

  constructor(public payload: ImageInterface) {}
}

export class LoadImages implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGES;

  constructor(public payload: number[]) {}
}

export class LoadImagesSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGES_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<ImageInterface>) {}
}

export class SaveImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE;

  constructor(public payload: { pk: number; data: ImageInterface }) {}
}

export class SaveImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_SUCCESS;

  constructor(public payload: { image: ImageInterface }) {}
}

export class SaveImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_FAILURE;

  constructor(public payload: { error: any }) {}
}
