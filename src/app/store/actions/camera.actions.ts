/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import type { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import type { CameraInterface } from "@core/interfaces/camera.interface";

export class LoadCamera implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_CAMERA;

  constructor(public payload: number) {}
}

export class LoadCameraSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_CAMERA_SUCCESS;

  constructor(public payload: CameraInterface) {}
}
