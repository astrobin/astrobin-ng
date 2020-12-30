// tslint:disable:max-classes-per-file

import { AppActionTypes } from "@app/store/actions/app.actions";
import { Action } from "@ngrx/store";
import { ImageInterface } from "@shared/interfaces/image.interface";

export class LoadImage implements Action {
  readonly type = AppActionTypes.LOAD_IMAGE;

  constructor(public payload: number) {}
}

export class LoadImageSuccess implements Action {
  readonly type = AppActionTypes.LOAD_IMAGE_SUCCESS;

  constructor(public payload: ImageInterface) {}
}
