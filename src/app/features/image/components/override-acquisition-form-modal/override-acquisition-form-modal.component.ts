import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum AcquisitionForm {
  LONG_EXPOSURE = "LONG_EXPOSURE",
  VIDEO_BASED = "VIDEO_BASED"
}

@Component({
  selector: "astrobin-override-acquisition-form-modal",
  templateUrl: "./override-acquisition-form-modal.component.html",
  styleUrls: ["./override-acquisition-form-modal.component.scss"]
})
export class OverrideAcquisitionFormModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    acquisitionForm: AcquisitionForm | null;
  } = {
    acquisitionForm: null
  };

  @ViewChild("optionTemplate")
  optionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.utilsService.delay(1).subscribe(() => {
      this._setFields();
    });
  }

  onOverrideClicked() {
    this.modal.close(this.model.acquisitionForm);
  }

  _setFields() {
    this.fields = [
      {
        key: "acquisitionForm",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          label: this.translateService.instant("Acquisition form"),
          optionTemplate: this.optionTemplate,
          options: of([
            {
              label: this.translateService.instant("Long exposure"),
              value: AcquisitionForm.LONG_EXPOSURE,
              description: this.translateService.instant(
                "You will specify things like number of frames and duration of each frame in seconds. Most commonly" +
                " used for deep sky astrophotography."
              )
            },
            {
              label: this.translateService.instant("Video based"),
              value: AcquisitionForm.VIDEO_BASED,
              description: this.translateService.instant(
                "You will specify things like number of frames, FPS, and duration of each frame in milliseconds. Most" +
                " commonly used for planetary imaging."
              )
            }
          ])
        }
      }
    ];
  }
}
