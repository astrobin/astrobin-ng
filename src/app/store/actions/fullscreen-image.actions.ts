/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { Action } from "@ngrx/store";
import { ImageInterface } from "@shared/interfaces/image.interface";

export class ShowFullscreenImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SHOW_FULLSCREEN_IMAGE;

  constructor(public payload: ImageInterface["pk"]) {
  }
}

export class HideFullscreenImage implements Action {
  readonly type = AppActionTypes.HIDE_FULLSCREEN_IMAGE;
}
