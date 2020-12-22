// tslint:disable:max-classes-per-file

import { Action } from "@ngrx/store";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";

export enum AppActionTypes {
  INITIALIZE = "[App] Initialize",
  INITIALIZE_SUCCESS = "[App] Initialize success",

  LOAD_TELESCOPE = "[App] Load telescope",
  LOAD_TELESCOPE_SUCCESS = "[App] Load telescope success",

  LOAD_CAMERA = "[App] Load camera",
  LOAD_CAMERA_SUCCESS = "[App] Load camera success"
}

export interface InitializeAppSuccessInterface {
  language: string;
  subscriptions: SubscriptionInterface[];
  backendConfig: BackendConfigInterface;
}

export class InitializeApp implements Action {
  readonly type = AppActionTypes.INITIALIZE;
}

export class InitializeAppSuccess implements Action {
  readonly type = AppActionTypes.INITIALIZE_SUCCESS;

  constructor(public payload: InitializeAppSuccessInterface) {}
}

export class LoadTelescope implements Action {
  readonly type = AppActionTypes.LOAD_TELESCOPE;

  constructor(public payload: number) {}
}

export class LoadTelescopeSuccess implements Action {
  readonly type = AppActionTypes.LOAD_TELESCOPE_SUCCESS;

  constructor(public payload: TelescopeInterface) {}
}

export class LoadCamera implements Action {
  readonly type = AppActionTypes.LOAD_CAMERA;

  constructor(public payload: number) {}
}

export class LoadCameraSuccess implements Action {
  readonly type = AppActionTypes.LOAD_CAMERA_SUCCESS;

  constructor(public payload: CameraInterface) {}
}

export type All =
  | InitializeApp
  | InitializeAppSuccess
  | LoadTelescope
  | LoadTelescopeSuccess
  | LoadCamera
  | LoadCameraSuccess;
