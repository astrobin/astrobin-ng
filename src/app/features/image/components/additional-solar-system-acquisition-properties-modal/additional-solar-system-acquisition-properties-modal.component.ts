import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Component({
  selector: "astrobin-additional-solar-system-acquisition-properties-modal",
  templateUrl: "./additional-solar-system-acquisition-properties-modal.component.html",
  styleUrls: ["./additional-solar-system-acquisition-properties-modal.component.scss"]
})
export class AdditionalSolarSystemAcquisitionPropertiesModalComponent extends BaseComponentDirective implements OnInit {
  imageEditService: ImageEditService;
  fields: FormlyFieldConfig[];
  fieldGroup: FormlyFieldConfig[];
  index: number;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal
  ) {
    super(store$);
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
