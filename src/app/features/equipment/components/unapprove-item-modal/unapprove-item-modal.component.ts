import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { LoadingService } from "@core/services/loading.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentActionTypes, UnapproveEquipmentItem } from "@features/equipment/store/equipment.actions";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, switchMap, take } from "rxjs/operators";

@Component({
  selector: "astrobin-approve-item-modal",
  templateUrl: "./unapprove-item-modal.component.html",
  styleUrls: ["./unapprove-item-modal.component.scss"]
})
export class UnapproveItemModalComponent extends BaseComponentDirective {
  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  othersInBrand: EquipmentItem[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$);
  }

  unapprove() {
    this.loadingService.setLoading(true);

    this.store$.dispatch(
      new UnapproveEquipmentItem({
        item: this.equipmentItem
      })
    );

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.UNAPPROVE_EQUIPMENT_ITEM_SUCCESS),
        take(1),
        switchMap(editProposal =>
          this.equipmentApiService
            .releaseReviewerLock(this.equipmentItem.klass, this.equipmentItem.id)
            .pipe(map(() => editProposal))
        )
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.modal.close();
      });
  }

  cancel() {
    this.loadingService.setLoading(true);

    this.equipmentApiService.releaseReviewerLock(this.equipmentItem.klass, this.equipmentItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      this.modal.dismiss();
    });
  }
}
