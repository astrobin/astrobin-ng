/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";

export class LoadThumbnail implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL;

  constructor(public payload: { data: Omit<ImageThumbnailInterface, "url">; bustCache: boolean }) {
  }
}

export class LoadThumbnailCancel implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL_CANCEL;

  constructor(public payload: Omit<ImageThumbnailInterface, "url">) {
  }
}

export class LoadThumbnailSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL_SUCCESS;

  constructor(public payload: ImageThumbnailInterface) {
  }
}

export class LoadThumbnailCanceled implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL_CANCELED;

  constructor(public payload: Omit<ImageThumbnailInterface, "url">) {
  }
}
