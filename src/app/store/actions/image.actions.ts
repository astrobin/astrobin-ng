/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { ImageEditModelInterface } from "@features/image/services/image-edit.service";
import { Action } from "@ngrx/store";

export interface LoadImageOptionsInterface {
  skipThumbnails: boolean;
}

export class ForceCheckImageAutoLoad implements Action {
  readonly type = AppActionTypes.FORCE_CHECK_IMAGE_AUTO_LOAD;
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

export class SaveImageRevision implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_REVISION;

  constructor(public payload: { revision: Partial<ImageRevisionInterface> }) {
  }
}

export class SaveImageRevisionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_REVISION_SUCCESS;

  constructor(public payload: { revision: ImageRevisionInterface }) {
  }
}

export class SaveImageRevisionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.SAVE_IMAGE_REVISION_FAILURE;

  constructor(public payload: { revision: Partial<ImageRevisionInterface>; error: any }) {
  }
}

export class PublishImage implements PayloadActionInterface {
  readonly type = AppActionTypes.PUBLISH_IMAGE;

  constructor(public payload: {
    pk: ImageInterface["pk"],
    skipNotifications: boolean,
    skipActivityStream: boolean,
  }) {
  }
}

export class PublishImageSuccess implements Action {
  readonly type = AppActionTypes.PUBLISH_IMAGE_SUCCESS;

  constructor(public payload: { pk: ImageInterface["pk"] }) {
  }
}

export class PublishImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.PUBLISH_IMAGE_FAILURE;

  constructor(public payload: { pk: ImageInterface["pk"], error?: any }) {
  }
}

export class UnpublishImage implements PayloadActionInterface {
  readonly type = AppActionTypes.UNPUBLISH_IMAGE;

  constructor(public payload: { pk: ImageInterface["pk"] }) {
  }
}

export class UnpublishImageSuccess implements Action {
  readonly type = AppActionTypes.UNPUBLISH_IMAGE_SUCCESS;

  constructor(public payload: { pk: ImageInterface["pk"] }) {
  }
}

export class UnpublishImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.UNPUBLISH_IMAGE_FAILURE;

  constructor(public payload: { pk: ImageInterface["pk"], error?: any }) {
  }
}

export class MarkImageAsFinal implements PayloadActionInterface {
  readonly type = AppActionTypes.MARK_IMAGE_AS_FINAL;

  constructor(public payload: { pk: ImageInterface["pk"]; revisionLabel: ImageRevisionInterface["label"] }) {
  }
}

export class MarkImageAsFinalSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.MARK_IMAGE_AS_FINAL_SUCCESS;

  constructor(public payload: { pk: ImageInterface["pk"]; revisionLabel: ImageRevisionInterface["label"] }) {
  }
}

export class MarkImageAsFinalFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.MARK_IMAGE_AS_FINAL_FAILURE;

  constructor(public payload: { pk: ImageInterface["pk"]; revisionLabel: ImageRevisionInterface["label"]; error: any }) {
  }
}

export class DeleteOriginalImage implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_ORIGINAL_IMAGE;

  constructor(public payload: { pk: ImageInterface["pk"] }) {
  }
}

export class DeleteOriginalImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_ORIGINAL_IMAGE_SUCCESS;

  constructor(public payload: { image: ImageInterface }) {
  }
}

export class DeleteOriginalImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_ORIGINAL_IMAGE_FAILURE;

  constructor(public payload: { pk: ImageInterface["pk"]; error: any }) {
  }
}

export class DeleteImageRevision implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_IMAGE_REVISION;

  constructor(public payload: { pk: ImageRevisionInterface["pk"] }) {
  }
}

export class DeleteImageRevisionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_IMAGE_REVISION_SUCCESS;

  constructor(public payload: { pk: ImageRevisionInterface["pk"] }) {
  }
}
export class DeleteImageRevisionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_IMAGE_REVISION_FAILURE;

  constructor(public payload: { pk: ImageRevisionInterface["pk"]; error: any }) {
  }
}

export class DeleteImage implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_IMAGE;

  constructor(public payload: { pk: ImageInterface["pk"] }) {
  }
}

export class DeleteImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_IMAGE_SUCCESS;

  constructor(public payload: { pk: ImageInterface["pk"] }) {
  }
}

export class DeleteImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_IMAGE_FAILURE;

  constructor(public payload: { pk: ImageInterface["pk"]; error: any }) {
  }
}
