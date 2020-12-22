// tslint:disable:max-classes-per-file

import { LoadCamera, LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { LoadImage, LoadImageSuccess } from "@app/store/actions/image.actions";
import { InitializeApp, InitializeAppSuccess } from "@app/store/actions/initialize-app.actions";
import { LoadTelescope, LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";

export enum AppActionTypes {
  INITIALIZE = "[App] Initialize",
  INITIALIZE_SUCCESS = "[App] Initialize success",

  LOAD_IMAGE = "[App] Load image",
  LOAD_IMAGE_SUCCESS = "[App] Load image success",

  LOAD_TELESCOPE = "[App] Load telescope",
  LOAD_TELESCOPE_SUCCESS = "[App] Load telescope success",

  LOAD_CAMERA = "[App] Load camera",
  LOAD_CAMERA_SUCCESS = "[App] Load camera success"
}

export type All =
  | InitializeApp
  | InitializeAppSuccess
  | LoadImage
  | LoadImageSuccess
  | LoadTelescope
  | LoadTelescopeSuccess
  | LoadCamera
  | LoadCameraSuccess;
