import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import { CreateLocationSuccess } from "@app/store/actions/location.actions";
import { LocationApiService } from "@shared/services/api/classic/astrobin/location/location-api.service";
import { UpdateCurrentUserProfile } from "@features/account/store/auth.actions";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";

@Injectable()
export class LocationEffects {
  CreateLocation: Observable<CreateLocationSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_LOCATION),
      switchMap(action => this.locationApiService.create(action.payload)),
      map(location => new CreateLocationSuccess(location))
    )
  );

  CreateLocationSuccess: Observable<UpdateCurrentUserProfile> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_LOCATION_SUCCESS),
      map(action => action.payload),
      switchMap(location =>
        this.store$.select(selectCurrentUserProfile).pipe(
          take(1),
          map(userProfile => ({
            currentLocations: userProfile.locations,
            newLocation: location
          }))
        )
      ),
      map(
        ({ currentLocations, newLocation }) =>
          new UpdateCurrentUserProfile({
            locations: [...currentLocations, ...[newLocation]]
          })
      )
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly locationApiService: LocationApiService
  ) {
  }
}
