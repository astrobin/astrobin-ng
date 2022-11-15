/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { LocationInterface } from "@shared/interfaces/location.interface";

export class CreateLocationAddTag implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_LOCATION_ADD_TAG;

  constructor(public payload: string) {
  }
}

export class CreateLocation implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_LOCATION;

  constructor(public payload: Omit<LocationInterface, "id">) {
  }
}

export class CreateLocationSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_LOCATION_SUCCESS;

  constructor(public payload: LocationInterface) {
  }
}
