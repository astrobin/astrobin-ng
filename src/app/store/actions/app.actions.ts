// tslint:disable:max-classes-per-file

import { Action } from "@ngrx/store";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";

export enum AppActionTypes {
  INITIALIZE = "[App] Initialize",
  INITIALIZE_SUCCESS = "[App] Initialize success"
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

export type All = InitializeApp | InitializeAppSuccess;
