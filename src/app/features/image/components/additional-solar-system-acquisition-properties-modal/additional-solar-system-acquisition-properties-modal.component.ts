import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AdditionalAcquisitionPropertiesBase } from "@features/image/components/additional-acquisition-properties-base/additional-acquisition-properties-base";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-additional-solar-system-acquisition-properties-modal",
  templateUrl: "./additional-solar-system-acquisition-properties-modal.component.html",
  styleUrls: ["./additional-solar-system-acquisition-properties-modal.component.scss"]
})
export class AdditionalSolarSystemAcquisitionPropertiesModalComponent extends AdditionalAcquisitionPropertiesBase implements OnInit {
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
        key: `solarSystemAcquisitions.${this.index}`,
        fieldGroup: this.fieldGroup
      }
    ];
  }
}
