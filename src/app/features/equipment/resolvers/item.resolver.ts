import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { LoadEquipmentItemSuccess } from "@features/equipment/store/equipment.actions";
import { WindowRefService } from "@shared/services/window-ref.service";

export const ItemResolver: ResolveFn<EquipmentItem> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  equipmentApiService = inject(EquipmentApiService),
  store$ = inject(Store<State>),
  windowRefService = inject(WindowRefService)
): Observable<EquipmentItem> => {
  const type: EquipmentItemType =
    EquipmentItemType[route.paramMap.get("itemType").toUpperCase()];
  const id: number = +route.paramMap.get("itemId");

  if (id === 0) {
    return of(null);
  }

  return equipmentApiService.getEquipmentItem(id, type, true).pipe(
    tap(item => {
      store$.dispatch(new LoadEquipmentItemSuccess({ item }));
    }),
    catchError(err => {
      windowRefService.routeTo404(state.url);
      return EMPTY;
    })
  );
};
