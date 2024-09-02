import { AppActionTypes } from "@app/store/actions/app.actions";
import { Action } from "@ngrx/store";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { RemoteSourceAffiliateInterface } from "@shared/interfaces/remote-source-affiliate.interface";

export class LoadRemoteSourceAffiliates implements Action {
  readonly type = AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES;
}

export class LoadRemoteSourceAffiliatesSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES_SUCCESS;

  constructor(public payload: { affiliates: RemoteSourceAffiliateInterface[] }) {
  }
}

export class LoadRemoteSourceAffiliatesFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES_FAILURE;

  constructor(public payload: { error: any }) {
  }
}
