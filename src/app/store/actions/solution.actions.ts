// tslint:disable:max-classes-per-file

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { SolutionInterface } from "@shared/interfaces/solution.interface";

export class LoadSolution implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTION;

  constructor(public payload: { contentType: number; objectId: string }) {}
}

export class LoadSolutionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTION_SUCCESS;

  constructor(public payload: SolutionInterface) {}
}

export class LoadSolutions implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTIONS;

  constructor(public payload: { contentType: number; objectIds: string[] }) {}
}

export class LoadSolutionsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTIONS_SUCCESS;

  constructor(public payload: SolutionInterface[]) {}
}
