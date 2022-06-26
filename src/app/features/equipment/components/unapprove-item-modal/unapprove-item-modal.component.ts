import { Component, Input, OnInit } from "@angular/core";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { map, switchMap, take } from "rxjs/operators";
import { EquipmentActionTypes, UnapproveEquipmentItem } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";

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
    public readonly store$: Store<State>,
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
