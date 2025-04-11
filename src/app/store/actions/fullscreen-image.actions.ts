/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { Action } from "@ngrx/store";

export class ShowFullscreenImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SHOW_FULLSCREEN_IMAGE;

  constructor(
    public payload: {
      imageId: ImageInterface["pk"];
      event?: MouseEvent | TouchEvent | null;
    }
  ) {}
}

export class HideFullscreenImage implements Action {
  readonly type = AppActionTypes.HIDE_FULLSCREEN_IMAGE;
}
