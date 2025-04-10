import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import type { MainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadMarketplaceListingSuccess } from "@features/equipment/store/equipment.actions";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { EMPTY } from "rxjs";
import { catchError, tap } from "rxjs/operators";

export const MarketplaceListingResolver: ResolveFn<MarketplaceListingInterface> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  equipmentApiService = inject(EquipmentApiService),
  store$ = inject(Store<MainState>),
  windowRefService = inject(WindowRefService)
): Observable<MarketplaceListingInterface> => {
  const id: string = route.paramMap.get("hashOrId");
  const isDigit = /^\d+$/.test(id);

  let apiCall: Observable<MarketplaceListingInterface>;

  if (isDigit) {
    apiCall = equipmentApiService.loadMarketplaceListing(+id);
  } else {
    apiCall = equipmentApiService.loadMarketplaceListingByHash(id);
  }

  return apiCall.pipe(
    tap(listing => {
      store$.dispatch(new LoadMarketplaceListingSuccess({ listing }));
    }),
    catchError(err => {
      windowRefService.routeTo404(state.url);
      return EMPTY;
    })
  );
};
