import type { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import type { SolutionInterface } from "@core/interfaces/solution.interface";
import { createSelector } from "@ngrx/store";

export const selectSolutions = createSelector(selectApp, (state: AppState): SolutionInterface[] => state.solutions);

export const selectSolution = createSelector(
  selectSolutions,
  (solutions: SolutionInterface[], data: { contentType: number; objectId: string }): SolutionInterface => {
    const matching = solutions.filter(
      solution => !!solution && solution.contentType === data.contentType && solution.objectId === data.objectId
    );
    return matching.length > 0 ? matching[0] : null;
  }
);
