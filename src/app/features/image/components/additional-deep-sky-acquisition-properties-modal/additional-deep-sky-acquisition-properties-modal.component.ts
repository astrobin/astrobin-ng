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
import { BortleScale } from "@shared/interfaces/deep-sky-acquisition.interface";

@Component({
  selector: "astrobin-additional-deep-sky-acquisition-properties-modal",
  templateUrl: "./additional-deep-sky-acquisition-properties-modal.component.html",
  styleUrls: ["./additional-deep-sky-acquisition-properties-modal.component.scss"]
})
export class AdditionalDeepSkyAcquisitionPropertiesModalComponent extends BaseComponentDirective implements OnInit {
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

  _isSyntheticHideExpression(): boolean {
    return this.imageEditService.model.deepSkyAcquisitions[this.index].isSynthetic;
  }

  _setFields() {
    this.fields = [
      {
        key: `deepSkyAcquisitions.${this.index}.isSynthetic`,
        type: "checkbox",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Synthetic channel"),
          required: false
        }
      },
      {
        key: `deepSkyAcquisitions.${this.index}`,
        wrappers: ["card-wrapper"],
        hideExpression: () => this._isSyntheticHideExpression(),
        templateOptions: {
          label: this.translateService.instant("Sensor")
        },
        fieldGroup: [
          {
            key: "iso",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: "ISO",
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "binning",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            props: {
              label: this.translateService.instant("Binning"),
              required: false,
              options: [1, 2, 3, 4].map(x => ({ value: x, label: `${x}x${x}` })),
              searchable: false,
              clearable: true
            }
          },
          {
            key: "gain",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Gain"),
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "sensorCooling",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Cooling"),
              description: this.translateService.instant("The temperature of the chip in Celsius degrees, e.g. -20."),
              required: false,
              step: 1,
              min: 0
            }
          }
        ]
      },
      {
        key: `deepSkyAcquisitions.${this.index}`,
        wrappers: ["card-wrapper"],
        hideExpression: () => this._isSyntheticHideExpression(),
        templateOptions: {
          label: this.translateService.instant("Optics")
        },
        fieldGroup: [
          {
            key: "fNumber",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("f-number"),
              description: this.translateService.instant(
                "If you used a camera lens, please specify the f-number (also known as f-ratio or f-stop) that you " +
                "used for this acquisition session."
              ),
              required: false,
              step: 1,
              min: 0
            }
          }
        ]
      },
      {
        key: `deepSkyAcquisitions.${this.index}`,
        wrappers: ["card-wrapper"],
        hideExpression: () => this._isSyntheticHideExpression(),
        templateOptions: {
          label: this.translateService.instant("Calibration")
        },
        fieldGroup: [
          {
            key: "darks",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Darks"),
              description: this.translateService.instant("The number of dark frames."),
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "flats",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Flats"),
              description: this.translateService.instant("The number of flat frames."),
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "flatDarks",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Darks"),
              description: this.translateService.instant("The number of dark flat frames."),
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "bias",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Bias"),
              description: this.translateService.instant("The number of bias/offset frames."),
              required: false,
              step: 1,
              min: 0
            }
          }
        ]
      },
      {
        key: `deepSkyAcquisitions.${this.index}`,
        wrappers: ["card-wrapper"],
        hideExpression: () => this._isSyntheticHideExpression(),
        templateOptions: {
          label: "Sky/Ambient conditions"
        },
        fieldGroup: [
          {
            key: "bortleScale",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            props: {
              label: this.translateService.instant("Bortle dark-sky scale"),
              description: this.translateService.instant(
                "Quality of the sky according to <a href=\"http://en.wikipedia.org/wiki/Bortle_Dark-Sky_Scale\" target=\"_blank\">the Bortle Scale</a>."
              ),
              required: false,
              options: [
                { value: BortleScale.ONE, label: "1 - Excellent dark-site sky (BLACK)" },
                { value: BortleScale.TWO, label: "2 - Typical truly dark site (GRAY)" },
                { value: BortleScale.THREE, label: "3 - Rural sky (BLUE)" },
                { value: BortleScale.FOUR, label: "4 - Rural/suburban transition (GREEN/YELLOW)" },
                { value: BortleScale.FIVE, label: "5 - Suburban sky (ORANGE)" },
                { value: BortleScale.SIX, label: "6 - Bright suburban sky (RED)" },
                { value: BortleScale.SEVEN, label: "7 - Suburban/urban transition or Full Moon (RED)" },
                { value: BortleScale.EIGHT, label: "8 - City sky (WHITE)" },
                { value: BortleScale.NINE, label: "9 - Inner city sky (WHITE)" }
              ],
              searchable: false,
              clearable: true
            }
          },
          {
            key: "meanSqm",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Mean mag/arcsec^2"),
              description: this.translateService.instant("Mean SQM mag/arcsec^2 as measured by your Sky Quality Meter."),
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "meanFwhm",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Mean FWHM"),
              description: this.translateService.instant("Mean SQM mag/arcsec^2 as measured by your Sky Quality Meter."),
              required: false,
              step: 1,
              min: 0
            }
          },
          {
            key: "temperature",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Temperature"),
              description: this.translateService.instant("Ambient temperature in Celsius degrees."),
              required: false,
              step: 1,
              min: 0
            }
          }
        ]
      }
    ];
  }
}
