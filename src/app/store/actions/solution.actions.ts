/* eslint-disable max-classes-per-file */

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { SolutionInterface } from "@core/interfaces/solution.interface";
import { Action } from "@ngrx/store";

export class LoadSolution implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTION;

  constructor(
    public payload: {
      contentType: number;
      objectId: string;
      includePixInsightDetails?: boolean;
      forceRefresh?: boolean;
    }
  ) {}
}

export class LoadSolutionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTION_SUCCESS;

  constructor(public payload: SolutionInterface) {}
}

export class LoadSolutionFailure implements Action {
  readonly type = AppActionTypes.LOAD_SOLUTION_FAILURE;
}

export class LoadSolutions implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTIONS;

  constructor(public payload: { contentType: number; objectIds: string[] }) {}
}

export class LoadSolutionsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_SOLUTIONS_SUCCESS;

  constructor(public payload: SolutionInterface[]) {}
}
