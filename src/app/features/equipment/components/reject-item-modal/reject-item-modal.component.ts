import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { take } from "rxjs/operators";
import { EquipmentActionTypes, RejectEquipmentItem } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";

@Component({
  selector: "astrobin-reject-item-modal",
  templateUrl: "./reject-item-modal.component.html",
  styleUrls: ["./reject-item-modal.component.scss"]
})
export class RejectItemModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    reason?: EquipmentItemReviewerRejectionReason;
    comment: string;
  } = {
    reason: null,
    comment: null
  };

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
      {
        key: "reason",
        type: "ng-select",
        id: "reason",
        templateOptions: {
          required: true,
          clearable: false,
          label: this.translateService.instant("Reason"),
          options: [
            {
              value: EquipmentItemReviewerRejectionReason.TYPO,
              label: this.translateService.instant("The target item has a typo in its name")
            },
            {
              value: EquipmentItemReviewerRejectionReason.WRONG_BRAND,
              label: this.translateService.instant("The target item doesn't seem to have the correct brand")
            },
            {
              value: EquipmentItemReviewerRejectionReason.INACCURATE_DATA,
              label: this.translateService.instant("The target item has some inaccurate data")
            },
            {
              value: EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA,
              label: this.translateService.instant("The target item has insufficient data")
            },
            {
              value: EquipmentItemReviewerRejectionReason.OTHER,
              label: this.translateService.instant("Other")
            }
          ]
        }
      },
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant("Comment"),
          required: false,
          rows: 4
        }
      }
    ];
  }

  reject() {
    this.loadingService.setLoading(true);

    const reason: EquipmentItemReviewerRejectionReason = this.form.get("reason").value;
    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new RejectEquipmentItem({
        item: this.equipmentItem,
        reason,
        comment
      })
    );

    this.actions$.pipe(ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS), take(1)).subscribe(() => {
      this.loadingService.setLoading(false);
      this.modal.close();
    });
  }
}
