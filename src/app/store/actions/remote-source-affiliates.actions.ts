import { AppActionTypes } from "@app/store/actions/app.actions";
import type { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import type { RemoteSourceAffiliateInterface } from "@core/interfaces/remote-source-affiliate.interface";
import type { Action } from "@ngrx/store";

export class LoadRemoteSourceAffiliates implements Action {
  readonly type = AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES;
}

export class LoadRemoteSourceAffiliatesSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES_SUCCESS;

  constructor(public payload: { affiliates: RemoteSourceAffiliateInterface[] }) {}
}

export class LoadRemoteSourceAffiliatesFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES_FAILURE;

  constructor(public payload: { error: any }) {}
}
