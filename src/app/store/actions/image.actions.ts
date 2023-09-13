/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { ImageEditModelInterface } from "@features/image/services/image-edit.service";

export interface LoadImageOptionsInterface {
  skipThumbnails: boolean;
}

export class LoadImage implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE;

  constructor(
    public payload: { imageId: ImageInterface["pk"] | ImageInterface["hash"]; options?: LoadImageOptionsInterface }
  ) {
  }
}

export class LoadImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE_SUCCESS;

  constructor(public payload: ImageInterface) {
  }
}

export class LoadImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE_FAILURE;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class SetImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_IMAGE;

  constructor(public payload: ImageInterface) {
  }
}

export class LoadImages implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGES;

  constructor(public payload: number[]) {
  }
}

export class LoadImagesSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGES_SUCCESS;

  constructor(public payload: PaginatedApiResultInterface<ImageInterface>) {
  }
}

export class LoadImageRevisions implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE_REVISIONS;

  constructor(public payload: { imageId: ImageInterface["pk"] }) {
  }
}

export class LoadImageRevisionsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_IMAGE_REVISIONS_SUCCESS;

  constructor(
    public payload: {
      imageId: ImageInterface["pk"];
      imageRevisions: PaginatedApiResultInterface<ImageRevisionInterface>;
    }
  ) {
  }
}

export class SaveImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE;

  constructor(public payload: { pk: number; image: ImageEditModelInterface }) {
  }
}

export class SaveImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_SUCCESS;

  constructor(public payload: { image: ImageEditModelInterface }) {
  }
}

export class SaveImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_FAILURE;

  constructor(public payload: { error: any }) {
  }
}
