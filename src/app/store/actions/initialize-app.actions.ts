/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import type { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import type { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import type { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import type { Action } from "@ngrx/store";

export interface InitializeAppSuccessInterface {
  language: string;
  subscriptions: SubscriptionInterface[];
  backendConfig: BackendConfigInterface;
  requestCountry: string;
}

export class InitializeApp implements Action {
  readonly type = AppActionTypes.INITIALIZE;
}

export class InitializeAppSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.INITIALIZE_SUCCESS;

  constructor(public payload: InitializeAppSuccessInterface) {}
}
