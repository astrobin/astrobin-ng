import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadSolutionSuccess } from "@app/store/actions/solution.actions";
import { selectSolution } from "@app/store/selectors/app/solution.selectors";
import { State } from "@app/store/state";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { SolutionApiService } from "@shared/services/api/classic/platesolving/solution/solution-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";

@Injectable()
export class SolutionEffects {
  @Effect()
  LoadSolution: Observable<LoadSolutionSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_SOLUTION),
    mergeMap(action =>
      this.store$.select(selectSolution, action.payload).pipe(
        mergeMap(solutionFromStore =>
          solutionFromStore !== null
            ? of(solutionFromStore).pipe(map(solution => new LoadSolutionSuccess(solution)))
            : this.solutionApiService.getSolution(action.payload.contentType, action.payload.objectId).pipe(
                map(solution => new LoadSolutionSuccess(solution)),
                catchError(error => EMPTY)
              )
        )
      )
    )
  );

  @Effect({ dispatch: false })
  LoadSolutionSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_SOLUTION_SUCCESS));

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly solutionApiService: SolutionApiService
  ) {}
}
