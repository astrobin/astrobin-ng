import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { EquipmentActionTypes, FindAll, FindAllSuccess } from "@features/equipment/store/equipment.actions";
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
      map((action: FindAll) => action.payload.q),
      mergeMap(q => this.equipmentApiService.findAll(q).pipe(map(items => new FindAllSuccess({ items }))))
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly equipmentApiService: EquipmentApiService
  ) {}
}
