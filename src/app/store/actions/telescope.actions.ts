/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { TelescopeInterface } from "@core/interfaces/telescope.interface";

export class LoadTelescope implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TELESCOPE;

  constructor(public payload: number) {}
}

export class LoadTelescopeSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TELESCOPE_SUCCESS;

  constructor(public payload: TelescopeInterface) {}
}
