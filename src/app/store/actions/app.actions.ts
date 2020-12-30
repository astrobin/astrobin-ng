// tslint:disable:max-classes-per-file

import { LoadCamera, LoadCameraSuccess } from "@app/store/actions/camera.actions";
import {
  HideFullscreenImage,
  SetHasFullscreenImage,
  ShowFullscreenImage
} from "@app/store/actions/fullscreen-image.actions";
import { LoadImage, LoadImageSuccess } from "@app/store/actions/image.actions";
import { InitializeApp, InitializeAppSuccess } from "@app/store/actions/initialize-app.actions";
import { LoadTelescope, LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";
import { LoadThumbnail, LoadThumbnailSuccess } from "@app/store/actions/thumbnail.actions";

export enum AppActionTypes {
  INITIALIZE = "[App] Initialize",
  INITIALIZE_SUCCESS = "[App] Initialize success",

  SET_HAS_FULLSCREEN_IMAGE = "[App] Set 'has fullscreen content'",
  SHOW_FULLSCREEN_IMAGE = "[App] Show full screen image",
  HIDE_FULLSCREEN_IMAGE = "[App] Hide full screen image",

  LOAD_IMAGE = "[App] Load image",
  LOAD_IMAGE_SUCCESS = "[App] Load image success",

  LOAD_THUMBNAIL = "[App] Load thumbnail",
  LOAD_THUMBNAIL_SUCCESS = "[App] Load thumbnail success",

  LOAD_TELESCOPE = "[App] Load telescope",
  LOAD_TELESCOPE_SUCCESS = "[App] Load telescope success",

  LOAD_CAMERA = "[App] Load camera",
  LOAD_CAMERA_SUCCESS = "[App] Load camera success"
}

export type All =
  | InitializeApp
  | InitializeAppSuccess
  | ShowFullscreenImage
  | HideFullscreenImage
  | LoadImage
  | LoadImageSuccess
  | LoadThumbnail
  | LoadThumbnailSuccess
  | LoadTelescope
  | LoadTelescopeSuccess
  | LoadCamera
  | LoadCameraSuccess;
