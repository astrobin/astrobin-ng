import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { LoadingService } from "@core/services/loading.service";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { ApproveEquipmentItemEditProposal, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import type { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import type {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/types/equipment-item-base.interface";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, switchMap, take } from "rxjs/operators";

@Component({
  selector: "astrobin-reject-edit-proposal-modal",
  templateUrl: "./approve-edit-proposal-modal.component.html",
  styleUrls: ["./approve-edit-proposal-modal.component.scss"]
})
export class ApproveEditProposalModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    comment: string;
  } = {
    comment: null
  };

  @Input()
  editProposal: EditProposalInterface<EquipmentItemBaseInterface>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.fields = [
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Comment"),
          required: false,
          rows: 4
        }
      }
    ];
  }

  approve() {
    this.loadingService.setLoading(true);

    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new ApproveEquipmentItemEditProposal({
        editProposal: this.editProposal,
        comment
      })
    );

    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS),
        take(1),
        switchMap(editProposal =>
          this.equipmentApiService
            .releaseEditProposalReviewLock(type, this.editProposal.id)
            .pipe(map(() => editProposal))
        )
      )
      .subscribe(() => {
        this.popNotificationsService.success(
          this.translateService.instant("This edit proposal has been approved."),
          this.translateService.instant("Thank you so much for contributing to the AstroBin equipment database! 🙌")
        );
        this.loadingService.setLoading(false);
        this.modal.close();
      });
  }

  cancel() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);
    this.equipmentApiService.releaseEditProposalReviewLock(type, this.editProposal.id).subscribe(() => {
      this.modal.dismiss();
    });
  }
}
