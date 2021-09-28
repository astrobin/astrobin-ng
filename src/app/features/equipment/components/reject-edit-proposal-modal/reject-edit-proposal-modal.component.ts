import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { take } from "rxjs/operators";
import { EquipmentActionTypes, RejectEquipmentItemEditProposal } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";

@Component({
  selector: "astrobin-reject-edit-proposal-modal",
  templateUrl: "./reject-edit-proposal-modal.component.html",
  styleUrls: ["./reject-edit-proposal-modal.component.scss"]
})
export class RejectEditProposalModalComponent extends BaseComponentDirective implements OnInit {
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
    public readonly modal: NgbActiveModal
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

  reject() {
    this.loadingService.setLoading(true);

    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new RejectEquipmentItemEditProposal({
        editProposal: this.editProposal,
        comment
      })
    );

    this.actions$
      .pipe(ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS), take(1))
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.modal.close();
      });
  }
}
