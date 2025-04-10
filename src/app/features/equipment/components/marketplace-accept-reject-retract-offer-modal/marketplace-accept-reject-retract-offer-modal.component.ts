import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";

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
    public readonly store$: Store<MainState>,
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
