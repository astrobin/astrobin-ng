import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { LoadingService } from "@shared/services/loading.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Component({
  selector: "astrobin-marketplace-accept-reject-retract-offer-modal",
  templateUrl: "./marketplace-accept-reject-retract-offer-modal.component.html",
  styleUrls: ["./marketplace-accept-reject-retract-offer-modal.component.scss"]
})
export class MarketplaceAcceptRejectRetractOfferModalComponent extends ConfirmationDialogComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  model: {
    message?: string;
  } = {};
  fields: FormlyFieldConfig[];

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService
  ) {
    super(store$, modal, translateService, loadingService);
  }

  ngOnInit() {
    super.ngOnInit();

    this._initFields();
  }

  close() {
    this.modal.close(this.model.message);
  }

  private _initFields() {
    this.fields = [
      {
        key: "message",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Message for the buyer"),
          rows: 4
        }
      }
    ];
  }
}
