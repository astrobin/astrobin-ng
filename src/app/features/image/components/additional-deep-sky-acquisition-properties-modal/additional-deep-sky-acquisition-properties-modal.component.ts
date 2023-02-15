import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { AdditionalAcquisitionPropertiesBase } from "@features/image/components/additional-acquisition-properties-base/additional-acquisition-properties-base";

@Component({
  selector: "astrobin-additional-deep-sky-acquisition-properties-modal",
  templateUrl: "./additional-deep-sky-acquisition-properties-modal.component.html",
  styleUrls: ["./additional-deep-sky-acquisition-properties-modal.component.scss"]
})
export class AdditionalDeepSkyAcquisitionPropertiesModalComponent extends AdditionalAcquisitionPropertiesBase implements OnInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$, modal, translateService, popNotificationsService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setFields();
  }

  _setFields() {
    this.fields = [
      {
        key: `deepSkyAcquisitions.${this.index}`,
        fieldGroup: this.fieldGroup
      }
    ];
  }
}
