/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import {
  InitializeAuthSuccessInterface,
  LoginFailureInterface,
  LoginPayloadInterface,
  LoginSuccessInterface
} from "@features/account/store/auth.actions.interfaces";
import { Action } from "@ngrx/store";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export enum AuthActionTypes {
  INITIALIZE = "[Auth] Initialize",
  INITIALIZE_SUCCESS = "[Auth] Initialize success",
  LOGIN = "[Auth] Login",
  LOGIN_SUCCESS = "[Auth] Login success",
  LOGIN_FAILURE = "[Auth] Login failure",
  LOGOUT = "[Auth] Logout",
  LOGOUT_SUCCESS = "[Auth] Logout success",
  UPDATE_CURRENT_USER_PROFILE = "[Auth] Update current user profile",
  UPDATE_CURRENT_USER_PROFILE_SUCCESS = "[Auth] Update current user profile success",
  LOAD_USER = "[Auth] Load user",
  LOAD_USER_SUCCESS = "[Auth] Load user success",
  LOAD_USER_PROFILE = "[Auth] Load user profile",
  LOAD_USER_PROFILE_SUCCESS = "[Auth] Load user profile success"
}

export class InitializeAuth implements Action {
  readonly type = AuthActionTypes.INITIALIZE;
}

export class InitializeAuthSuccess implements PayloadActionInterface {
  readonly type = AuthActionTypes.INITIALIZE_SUCCESS;

  constructor(public payload: InitializeAuthSuccessInterface) {
  }
}

export class Login implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOGIN;

  constructor(public payload: LoginPayloadInterface) {
  }
}

export class LoginSuccess implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOGIN_SUCCESS;

  constructor(public payload: LoginSuccessInterface) {
  }
}

export class LoginFailure implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOGIN_FAILURE;

  constructor(public payload: LoginFailureInterface) {
  }
}

export class Logout implements Action {
  readonly type = AuthActionTypes.LOGOUT;
}

export class LogoutSuccess implements Action {
  readonly type = AuthActionTypes.LOGOUT_SUCCESS;
}

export class UpdateCurrentUserProfile implements PayloadActionInterface {
  readonly type = AuthActionTypes.UPDATE_CURRENT_USER_PROFILE;

  constructor(public payload: Partial<UserProfileInterface>) {
  }
}

export class UpdateCurrentUserProfileSuccess implements PayloadActionInterface {
  readonly type = AuthActionTypes.UPDATE_CURRENT_USER_PROFILE_SUCCESS;

  constructor(public payload: UserProfileInterface) {
  }
}

export class LoadUser implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOAD_USER;

  constructor(public payload: { id: UserInterface["id"] }) {
  }
}

export class LoadUserSuccess implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOAD_USER_SUCCESS;

  constructor(public payload: { user: UserInterface }) {
  }
}

export class LoadUserProfile implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOAD_USER_PROFILE;

  constructor(public payload: { id: UserProfileInterface["id"] }) {
  }
}

export class LoadUserProfileSuccess implements PayloadActionInterface {
  readonly type = AuthActionTypes.LOAD_USER_PROFILE_SUCCESS;

  constructor(public payload: { userProfile: UserProfileInterface }) {
  }
}

export type All =
  | InitializeAuth
  | InitializeAuthSuccess
  | Login
  | LoginSuccess
  | LoginFailure
  | Logout
  | LogoutSuccess
  | UpdateCurrentUserProfile
  | UpdateCurrentUserProfileSuccess
  | LoadUser
  | LoadUserSuccess
  | LoadUserProfile
  | LoadUserProfileSuccess;
