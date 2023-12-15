import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { combineLatest, Observable, Observer } from "rxjs";
import { filter, map } from "rxjs/operators";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { Actions, ofType } from "@ngrx/effects";
import { All } from "@app/store/actions/app.actions";
import { EquipmentActionTypes, LoadMarketplaceListing } from "@features/equipment/store/equipment.actions";
import { selectMarketplaceListingByHash } from "@features/equipment/store/equipment.selectors";
import { AuthService } from "@shared/services/auth.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";

@Injectable()
export class MarketplaceListingOwnerGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly store$: Store<State>,
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
