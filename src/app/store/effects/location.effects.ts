import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { MainState } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { CreateLocationSuccess } from "@app/store/actions/location.actions";
import { LocationApiService } from "@core/services/api/classic/astrobin/location/location-api.service";
import { LoadUserProfile, UpdateUserProfile } from "@features/account/store/auth.actions";
import { selectUserProfile } from "@features/account/store/auth.selectors";

@Injectable()
export class LocationEffects {
  CreateLocation: Observable<CreateLocationSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_LOCATION),
      switchMap(action => this.locationApiService.create(action.payload)),
      map(location => new CreateLocationSuccess(location))
    )
  );

  CreateLocationSuccess: Observable<UpdateUserProfile> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_LOCATION_SUCCESS),
      map(action => action.payload),
      tap(location => this.store$.dispatch(new LoadUserProfile({ id: location.user }))),
      switchMap(location => this.store$.select(selectUserProfile, location.user).pipe(
        filter(userProfile => !!userProfile),
        take(1),
        map(userProfile => ({ userProfile, location }))
      )),
      map(
        ({ userProfile, location }) =>
          new UpdateUserProfile({
            id: userProfile.id,
            locations: [
              ...userProfile.locations,
              ...[location]
            ]
          })
      )
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly locationApiService: LocationApiService
  ) {
  }
}
