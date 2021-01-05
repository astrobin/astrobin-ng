// tslint:disable:max-classes-per-file

import { AppActionTypes } from "@app/store/actions/app.actions";
import { Action } from "@ngrx/store";
import { SolutionInterface } from "@shared/interfaces/solution.interface";

export class LoadSolution implements Action {
  readonly type = AppActionTypes.LOAD_SOLUTION;

  constructor(public payload: { contentType: number; objectId: string }) {}
}

export class LoadSolutionSuccess implements Action {
  readonly type = AppActionTypes.LOAD_SOLUTION_SUCCESS;

  constructor(public payload: SolutionInterface) {}
}
