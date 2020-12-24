import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";
import { AppState } from "@app/store/app.states";
import { selectTelescope } from "@app/store/selectors/app/telescope.selectors";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TelescopeApiService } from "@shared/services/api/classic/gear/telescope/telescope-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap, switchMap, withLatestFrom } from "rxjs/operators";

@Injectable()
export class TelescopeEffects {
  @Effect()
  LoadTelescope: Observable<LoadTelescopeSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_TELESCOPE),
    withLatestFrom(action =>
      this.store$.select(selectTelescope, action.payload).pipe(map(result => ({ action, result })))
    ),
    switchMap(observable => observable),
    mergeMap(({ action, result }) =>
      result !== null
        ? of(result).pipe(map(telescope => new LoadTelescopeSuccess(telescope)))
        : this.telescopeApiService.getTelescope(action.payload).pipe(
            map(telescope => new LoadTelescopeSuccess(telescope)),
            catchError(error => EMPTY)
          )
    )
  );

  @Effect({ dispatch: false })
  LoadTelescopeSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_TELESCOPE_SUCCESS));

  constructor(
    public readonly store$: Store<AppState>,
    public readonly actions$: Actions<All>,
    public readonly telescopeApiService: TelescopeApiService
  ) {}
}
