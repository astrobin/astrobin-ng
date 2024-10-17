/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export enum UserActionTypes {
  LOAD_GALLERY = "[User] Load Gallery",
  LOAD_GALLERY_SUCCESS = "[User] Load Gallery Success",
  LOAD_GALLERY_FAILURE = "[User] Load Gallery Failure",
}

export class LOAD_GALLERY implements PayloadActionInterface {
  readonly type = UserActionTypes.LOAD_GALLERY;

  constructor(public payload: { userId: UserInterface["id"] }) {}
}

export class LOAD_GALLERY_SUCCESS implements PayloadActionInterface {
  readonly type = UserActionTypes.LOAD_GALLERY_SUCCESS;

  constructor(public payload: { userId: UserInterface["id"], gallery: PaginatedApiResultInterface<ImageInterface> }) {}
}

export class LOAD_GALLERY_FAILURE implements PayloadActionInterface {
  readonly type = UserActionTypes.LOAD_GALLERY_FAILURE;

  constructor(public payload: { userId: UserInterface["id"], error: any }) {}
}

export type UserActions =
  | LOAD_GALLERY
  | LOAD_GALLERY_SUCCESS
  | LOAD_GALLERY_FAILURE;
