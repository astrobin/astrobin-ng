/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";

export class LoadThumbnail implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL;

  constructor(public payload: { data: Omit<ImageThumbnailInterface, "url">; bustCache: boolean }) {}
}

export class LoadThumbnailSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL_SUCCESS;

  constructor(public payload: ImageThumbnailInterface) {}
}

export class LoadThumbnailCancel implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_THUMBNAIL_CANCEL;

  constructor(public payload: { thumbnail: Omit<ImageThumbnailInterface, "url"> }) {}
}
