import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import { AdditionalAcquisitionPropertiesBase } from "@features/image/components/additional-acquisition-properties-base/additional-acquisition-properties-base";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-additional-solar-system-acquisition-properties-modal",
  templateUrl: "./additional-solar-system-acquisition-properties-modal.component.html",
  styleUrls: ["./additional-solar-system-acquisition-properties-modal.component.scss"]
})
export class AdditionalSolarSystemAcquisitionPropertiesModalComponent
  extends AdditionalAcquisitionPropertiesBase
  implements OnInit
{
  constructor(
    public readonly store$: Store<MainState>,
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
