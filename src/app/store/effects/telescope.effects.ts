import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";
import { AppState } from "@app/store/app.states";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TelescopeApiService } from "@shared/services/api/classic/gear/telescope/telescope-api.service";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class TelescopeEffects {
  @Effect()
  LoadTelescope: Observable<LoadTelescopeSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_TELESCOPE),
    map(action => action.payload),
    switchMap(payload =>
      this.telescopeApiService.getTelescope(payload).pipe(map(telescope => new LoadTelescopeSuccess(telescope)))
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
