import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  EquipmentActionTypes,
  FindAllEquipmentItemsSuccess,
  FindSimilarInBrand
} from "@features/equipment/store/equipment.actions";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { Actions, ofType } from "@ngrx/effects";
import { map, switchMap } from "rxjs/operators";
import { Observable } from "rxjs";

export enum ConfirmItemCreationResult {
  CANCEL
}

@Component({
  selector: "astrobin-confirm-item-creation-modal",
  templateUrl: "./confirm-item-creation-modal.component.html",
  styleUrls: ["./confirm-item-creation-modal.component.scss"]
})
export class ConfirmItemCreationModalComponent extends BaseComponentDirective implements OnInit {
  ConfirmItemCreationResult = ConfirmItemCreationResult;

  @Input()
  item: EquipmentItemBaseInterface;

  similarItems$: Observable<EquipmentItemBaseInterface[]>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnInit() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.item);

    this.store$.dispatch(new FindSimilarInBrand({ brand: this.item.brand, q: this.item.name, type }));

    this.similarItems$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items)
    );
  }

  useSuggestion(item: EquipmentItemBaseInterface) {
    this.modal.close(item);
  }
}
