import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";
import { selectTelescope } from "@app/store/selectors/app/telescope.selectors";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TelescopeApiService } from "@shared/services/api/classic/gear/telescope/telescope-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";

@Injectable()
export class TelescopeEffects {
  LoadTelescope: Observable<LoadTelescopeSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_TELESCOPE),
      mergeMap(action =>
        this.store$.select(selectTelescope, action.payload).pipe(
          mergeMap(telescopeFromStore =>
            telescopeFromStore !== null
              ? of(telescopeFromStore).pipe(map(telescope => new LoadTelescopeSuccess(telescope)))
              : this.telescopeApiService.get(action.payload).pipe(
                  map(telescope => new LoadTelescopeSuccess(telescope)),
                  catchError(error => EMPTY)
                )
          )
        )
      )
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly telescopeApiService: TelescopeApiService
  ) {}
}
