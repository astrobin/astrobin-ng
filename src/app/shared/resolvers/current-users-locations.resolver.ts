import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { filter, first, map, switchMap } from "rxjs/operators";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { LocationInterface } from "@shared/interfaces/location.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UsersLocationsApiService } from "@shared/services/api/classic/users/users-locations-api.service";
import { UtilsService } from "@shared/services/utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class CurrentUsersLocationsResolver implements Resolve<LocationInterface[]> {
  constructor(private readonly store$: Store<State>, private readonly locationsApiService: UsersLocationsApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.store$.select(selectCurrentUserProfile).pipe(
      filter((currentUserProfile: UserProfileInterface) => !!currentUserProfile),
      map((currentUserProfile: UserProfileInterface) => currentUserProfile.locations),
      switchMap(profileLocations =>
        this.locationsApiService.getAll().pipe(
          map(response => ({
            profileLocations,
            existingImagesLocations: response.results
          }))
        )
      ),
      map(({ profileLocations, existingImagesLocations }) =>
        this.uniqueValidLocations([...profileLocations, ...existingImagesLocations])
      ),
      first()
    );
  }

  uniqueValidLocations(allLocations: LocationInterface[]): LocationInterface[] {
    if (!allLocations || allLocations.length === 0) {
      return [];
    }

    const uniques = new UtilsService().arrayUniqueObjects(Array.from(new Set(allLocations)));

    return uniques?.filter(location => !!location.name && location.lat_deg !== null && location.lon_deg !== null);
  }
}
