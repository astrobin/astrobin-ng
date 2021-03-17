// tslint:disable:max-classes-per-file

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";

export enum ImageActionTypes {
  SET_CROPPER_SHOWN = "[Image] Set cropper shown"
}

export class ImageEditorSetCropperShown implements PayloadActionInterface {
  readonly type = ImageActionTypes.SET_CROPPER_SHOWN;

  constructor(public payload: boolean) {}
}

export type ImageActions = ImageEditorSetCropperShown;
