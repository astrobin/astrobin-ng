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
import { SeeingScale, TransparencyScale } from "@shared/interfaces/solar-system-acquisition.interface";

@Component({
  selector: "astrobin-additional-solar-system-acquisition-properties-modal",
  templateUrl: "./additional-solar-system-acquisition-properties-modal.component.html",
  styleUrls: ["./additional-solar-system-acquisition-properties-modal.component.scss"]
})
export class AdditionalSolarSystemAcquisitionPropertiesModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  index: number;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly imageEditService: ImageEditService
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
        wrappers: ["card-wrapper"],
        templateOptions: {
          label: this.translateService.instant("Optics")
        },
        fieldGroup: [
          {
            key: "focalLength",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Focal length") + " mm",
              description: this.translateService.instant(
                "The focal length of the whole optical train, including barlow lenses or other components."
              ),
              required: false,
              step: 1,
              min: 0
            },
            validators: {
              validation: ["whole-number"]
            }
          }
        ]
      },
      {
        key: `solarSystemAcquisitions.${this.index}`,
        wrappers: ["card-wrapper"],
        templateOptions: {
          label: "Sky/Ambient conditions"
        },
        fieldGroup: [
          {
            key: "seeing",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            props: {
              label: this.translateService.instant("Seeing"),
              description: this.translateService.instant(
                "Your estimation of the seeing."
              ),
              required: false,
              options: [
                { value: SeeingScale.VERY_BAD, label: this.translateService.instant("Very bad") },
                { value: SeeingScale.BAD, label: this.translateService.instant("Bad") },
                { value: SeeingScale.ACCEPTABLE, label: this.translateService.instant("Acceptable") },
                { value: SeeingScale.GOOD, label: this.translateService.instant("Good") },
                { value: SeeingScale.EXCELLENT, label: this.translateService.instant("Excellent") }
              ],
              searchable: false,
              clearable: true
            }
          },
          {
            key: "transparency",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            props: {
              label: this.translateService.instant("Transparency"),
              description: this.translateService.instant(
                "Your estimation of the transparency."
              ),
              required: false,
              options: [
                { value: TransparencyScale.EXTREMELY_BAD, label: this.translateService.instant("Extremely bad") },
                { value: TransparencyScale.VERY_BAD, label: this.translateService.instant("Very bad") },
                { value: TransparencyScale.BAD, label: this.translateService.instant("Bad") },
                { value: TransparencyScale.MEDIOCRE, label: this.translateService.instant("Mediocre") },
                { value: TransparencyScale.ACCEPTABLE, label: this.translateService.instant("Acceptable") },
                { value: TransparencyScale.FAIR, label: this.translateService.instant("Fair") },
                { value: TransparencyScale.GOOD, label: this.translateService.instant("Good") },
                { value: TransparencyScale.VERY_GOOD, label: this.translateService.instant("Very good") },
                { value: TransparencyScale.EXCELLENT, label: this.translateService.instant("Excellent") },
                { value: TransparencyScale.SUPERB, label: this.translateService.instant("Superb") }
              ],
              searchable: false,
              clearable: true
            }
          }
        ]
      },
      {
        key: `solarSystemAcquisitions.${this.index}`,
        wrappers: ["card-wrapper"],
        templateOptions: {
          label: "Central meridians"
        },
        fieldGroup: [
          {
            key: "cmi",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("CMI"),
              description: this.translateService.instant("Latitude of the first Central Meridian."),
              required: false,
              step: 1,
              min: 0,
              max: 359.99
            },
            validators: {
              validation: [
                {
                  name: "max-decimals",
                  options: {
                    value: 2
                  }
                }
              ]
            }
          },
          {
            key: "cmii",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("CMII"),
              description: this.translateService.instant("Latitude of the second Central Meridian."),
              required: false,
              step: 1,
              min: 0,
              max: 359.99
            },
            validators: {
              validation: [
                {
                  name: "max-decimals",
                  options: {
                    value: 2
                  }
                }
              ]
            }
          },
          {
            key: "cmiii",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("CMIII"),
              description: this.translateService.instant("Latitude of the third Central Meridian."),
              required: false,
              step: 1,
              min: 0,
              max: 359.99
            },
            validators: {
              validation: [
                {
                  name: "max-decimals",
                  options: {
                    value: 2
                  }
                }
              ]
            }
          }
        ]
      }
    ];
  }
}
