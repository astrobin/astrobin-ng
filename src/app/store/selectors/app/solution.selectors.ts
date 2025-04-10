import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { SolutionInterface } from "@core/interfaces/solution.interface";
import { createSelector } from "@ngrx/store";

export const selectSolutions = createSelector(selectApp, (state: AppState): SolutionInterface[] => state.solutions);

export const selectSolutionMatrices = createSelector(selectApp, (state: AppState): { [solutionId: number]: any } => state.solutionMatrices);

export const selectSolutionMatricesLoading = createSelector(selectApp, (state: AppState): Set<number> => state.solutionMatricesLoading);

export const selectIsSolutionMatrixLoading = createSelector(
  selectSolutionMatricesLoading,
  (loading: Set<number>, solutionId: number): boolean => {
    console.log(`[Selector] Checking if ${solutionId} is loading. Loading set:`, Array.from(loading));
    const isLoading = loading.has(solutionId);
    console.log(`[Selector] Is ${solutionId} loading? ${isLoading}`);
    return isLoading;
  }
);

export const selectSolution = createSelector(
  selectSolutions,
  (solutions: SolutionInterface[], data: { contentType: number; objectId: string }): SolutionInterface => {
    const matching = solutions.filter(
      solution => !!solution && solution.contentType === data.contentType && solution.objectId === data.objectId
    );
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectSolutionMatrix = createSelector(
  selectSolutionMatrices,
  (matrices: { [solutionId: number]: any }, solutionId: number): any => {
    return matrices[solutionId] || null;
  }
);
