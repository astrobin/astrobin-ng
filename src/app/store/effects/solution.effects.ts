import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import {
  LoadSolutionFailure,
  LoadSolutionMatrix,
  LoadSolutionMatrixFailure,
  LoadSolutionMatrixStart,
  LoadSolutionMatrixSuccess,
  LoadSolutionsSuccess,
  LoadSolutionSuccess
} from "@app/store/actions/solution.actions";
import {
  selectIsSolutionMatrixLoading,
  selectSolution,
  selectSolutionMatrix
} from "@app/store/selectors/app/solution.selectors";
import { MainState } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { SolutionApiService } from "@core/services/api/classic/platesolving/solution/solution-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, concatMap, map, mergeMap, take } from "rxjs/operators";

@Injectable()
export class SolutionEffects {
  LoadSolution: Observable<LoadSolutionSuccess | LoadSolutionFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_SOLUTION),
      mergeMap(action => {
        const loadFromApi$ = this.solutionApiService.getSolution(
          action.payload.contentType,
          action.payload.objectId,
          action.payload.includePixInsightDetails
        ).pipe(
          map(solution => (!!solution ? new LoadSolutionSuccess(solution) : new LoadSolutionFailure())),
          catchError(() => of(new LoadSolutionFailure()))
        );

        // If forceRefresh is true, skip store check and load directly from API
        if (action.payload.forceRefresh || action.payload.includePixInsightDetails) {
          return loadFromApi$;
        }

        // Otherwise, check the store and only load from API if solution is not found
        return this.store$.select(selectSolution, action.payload).pipe(
          mergeMap(solutionFromStore =>
            solutionFromStore !== null
              ? of(new LoadSolutionSuccess(solutionFromStore))
              : loadFromApi$
          )
        );
      })
    )
  );

  LoadSolutions: Observable<LoadSolutionsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_SOLUTIONS),
      mergeMap(action =>
        this.solutionApiService.getSolutions(action.payload.contentType, action.payload.objectIds).pipe(
          map(solutions => new LoadSolutionsSuccess(solutions)),
          catchError(error => EMPTY)
        )
      )
    )
  );

  LoadSolutionMatrix: Observable<LoadSolutionMatrixStart | LoadSolutionMatrixSuccess | LoadSolutionMatrixFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_SOLUTION_MATRIX),
      // Use concatMap instead of mergeMap to process one at a time and avoid race conditions
      concatMap((action: LoadSolutionMatrix) => {
        // First check if the matrix is already in the store
        return this.store$.select(selectSolutionMatrix, action.payload.solutionId).pipe(
          take(1),
          concatMap(matrixFromStore => {
            // If matrix already exists in store, no need to fetch it again
            if (matrixFromStore) {
              return of(new LoadSolutionMatrixSuccess({
                solutionId: action.payload.solutionId,
                matrix: matrixFromStore
              }));
            }

            // Check if this matrix is already being loaded
            return this.store$.select(selectIsSolutionMatrixLoading, action.payload.solutionId).pipe(
              take(1),
              concatMap(isLoading => {

                // If already loading, don't dispatch duplicate request
                if (isLoading) {
                  return EMPTY;
                }

                // Otherwise, mark as loading and proceed with the API call
                return of(new LoadSolutionMatrixStart({ solutionId: action.payload.solutionId })).pipe(
                  concatMap(() => {
                    return this.solutionApiService.getAdvancedMatrix(action.payload.solutionId).pipe(
                      map(matrix => {
                        return new LoadSolutionMatrixSuccess({
                          solutionId: action.payload.solutionId,
                          matrix
                        });
                      }),
                      catchError(error => {
                        return of(new LoadSolutionMatrixFailure({
                          solutionId: action.payload.solutionId
                        }));
                      })
                    );
                  })
                );
              })
            );
          })
        );
      })
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly solutionApiService: SolutionApiService
  ) {
  }
}
