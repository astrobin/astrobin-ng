import { Action } from "@ngrx/store";

export interface PayloadActionInterface extends Action {
  payload: any;
}
