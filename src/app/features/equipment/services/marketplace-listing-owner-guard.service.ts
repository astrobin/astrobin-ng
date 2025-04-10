import type { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import type { All } from "@app/store/actions/app.actions";
import type { MainState } from "@app/store/state";
import type { AuthService } from "@core/services/auth.service";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentActionTypes, LoadMarketplaceListing } from "@features/equipment/store/equipment.actions";
import { selectMarketplaceListingByHash } from "@features/equipment/store/equipment.selectors";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { Observer } from "rxjs";
import { combineLatest, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MarketplaceListingOwnerGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public loadingService: LoadingService,
    public authService: AuthService,
    public equipmentApiService: EquipmentApiService,
    public router: Router,
    public location: Location
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const onSuccess = (observer: Observer<boolean>) => {
      observer.next(true);
      observer.complete();
    };

    const onError = (observer: Observer<boolean>, redirectTo: string) => {
      this.router.navigateByUrl(redirectTo, { skipLocationChange: true }).then(() => {
        observer.next(false);
        observer.complete();
        this.location.replaceState(state.url);
      });
    };

    return new Observable<boolean>(observer => {
      this.authService.isAuthenticated$().subscribe(authenticated => {
        if (!authenticated) {
          observer.next(false);
          observer.complete();
          return;
        }

        const hash = route.params["hash"];

        this.store$.dispatch(new LoadMarketplaceListing({ hash }));

        combineLatest([
          this.store$.select(selectCurrentUser).pipe(
            filter(user => !!user),
            map(user => user.id)
          ),
          this.store$.select(selectMarketplaceListingByHash(hash)).pipe(filter(listing => !!listing))
        ])
          .pipe(map(result => result[0] === result[1].user))
          .subscribe(canActivate => {
            if (canActivate) {
              onSuccess(observer);
            } else {
              onError(observer, "/permission-denied");
            }
          });

        this.actions$.pipe(ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTING_FAILURE)).subscribe(error => {
          onError(observer, "/404");
        });
      });
    });
  }
}
