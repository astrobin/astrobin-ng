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
import { Actions } from "@ngrx/effects";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "astrobin-reject-review-gear-renaming-proposals-modal",
  templateUrl: "./reject-review-gear-renaming-proposals-modal.component.html",
  styleUrls: ["./reject-review-gear-renaming-proposals-modal.component.scss"]
})
export class RejectReviewGearRenamingProposalsModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    rejectReason: string;
  } = {
    rejectReason: null
  };

  @Input()
  editProposal: EditProposalInterface<EquipmentItemBaseInterface>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly http: HttpClient
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.fields = [
      {
        key: "rejectReason",
        type: "textarea",
        id: "reject-reason",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant("Reason"),
          required: true,
          rows: 4
        }
      }
    ];
  }

  reject() {
    this.loadingService.setLoading(true);

    const reason: string = this.form.get("rejectReason").value;

    this.modal.close(reason);
  }
}
