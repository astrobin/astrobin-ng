/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";

export class LoadCamera implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_CAMERA;

  constructor(public payload: number) {
  }
}

export class LoadCameraSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_CAMERA_SUCCESS;

  constructor(public payload: CameraInterface) {
  }
}
