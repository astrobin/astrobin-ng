import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { take } from "rxjs/operators";
import { ApproveEquipmentItemEditProposal, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

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
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
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

  approve() {
    this.loadingService.setLoading(true);

    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new ApproveEquipmentItemEditProposal({
        editProposal: this.editProposal,
        comment
      })
    );

    this.actions$
      .pipe(ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS), take(1))
      .subscribe(() => {
        this.popNotificationsService.success(
          this.translateService.instant("This edit proposal has been approved."),
          this.translateService.instant("Thank you so much for contributing to the AstroBin equipment database! 🙌")
        );
        this.loadingService.setLoading(false);
        this.modal.close();
      });
  }
}
