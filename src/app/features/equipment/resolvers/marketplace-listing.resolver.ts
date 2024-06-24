import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { EMPTY, Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadMarketplaceListingSuccess } from "@features/equipment/store/equipment.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

export const MarketplaceListingResolver: ResolveFn<MarketplaceListingInterface> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  equipmentApiService = inject(EquipmentApiService),
  store$ = inject(Store<State>),
  windowRefService = inject(WindowRefService)
): Observable<MarketplaceListingInterface> => {
  const hash: string = route.paramMap.get("hash");

  return equipmentApiService.loadMarketplaceListingByHash(hash).pipe(
    tap(listing => {
      store$.dispatch(new LoadMarketplaceListingSuccess({ listing }));
    }),
    catchError(err => {
      windowRefService.routeTo404(state.url);
      return EMPTY;
    })
  );
};
