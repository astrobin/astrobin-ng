import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  EquipmentActionTypes,
  FindAll,
  FindAllSuccess,
  LoadBrand,
  LoadBrandSuccess
} from "@features/equipment/store/equipment.actions";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { All } from "@app/store/actions/app.actions";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { map, mergeMap } from "rxjs/operators";

@Injectable()
export class EquipmentEffects {
  FindAll: Observable<FindAllSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL),
      map((action: FindAll) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.findAll(payload.q, payload.type).pipe(map(items => new FindAllSuccess({ items })))
      )
    )
  );

  LoadBrand: Observable<LoadBrandSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_BRAND),
      map((action: LoadBrand) => action.payload.id),
      mergeMap(id => this.equipmentApiService.getBrand(id).pipe(map(brand => new LoadBrandSuccess({ brand }))))
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly equipmentApiService: EquipmentApiService
  ) {}
}
