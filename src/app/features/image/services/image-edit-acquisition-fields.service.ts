import { Injectable, OnDestroy, TemplateRef } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { selectEquipmentItems } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { map, takeUntil } from "rxjs/operators";
import { distinctUntilChangedObj, UtilsService } from "@shared/services/utils/utils.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AdditionalDeepSkyAcquisitionPropertiesModalComponent } from "@features/image/components/additional-deep-sky-acquisition-properties-modal/additional-deep-sky-acquisition-properties-modal.component";
import { Subscription } from "rxjs";
import { SubjectType } from "@shared/interfaces/image.interface";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";
import { AdditionalSolarSystemAcquisitionPropertiesModalComponent } from "@features/image/components/additional-solar-system-acquisition-properties-modal/additional-solar-system-acquisition-properties-modal.component";
import { SeeingScale, TransparencyScale } from "@shared/interfaces/solar-system-acquisition.interface";
import { BortleScale } from "@shared/interfaces/deep-sky-acquisition.interface";
import { AcquisitionForm } from "@features/image/components/override-acquisition-form-modal/override-acquisition-form-modal.component";

@Injectable({
  providedIn: null
})
export class ImageEditAcquisitionFieldsService extends ImageEditFieldsBaseService implements OnDestroy {
  acquisitionFilterSelectFooterTemplateExtra: TemplateRef<any>;

  acquisitionAdditionalButtonsTemplate: TemplateRef<any>;

  private _subjectTypeChangesSubscription: Subscription;

  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService
  ) {
    super(loadingService);
  }

  onFieldsInitialized(): void {
    this._subjectTypeChangesSubscription = this.imageEditService.form
      .get("subjectType")
      .valueChanges.subscribe(subjectType => {
        const stepper = this.imageEditService.fields.find(field => field.id === "image-stepper-field");
        const acquisitionStep = stepper.fieldGroup.find(field => field.id === "image-stepper-acquisition");
        const field = acquisitionStep.fieldGroup.find(field => field.key === "unsupportedSubjectTypeForAcquisitions");

        field.template = this._getUnsupportedSubjectTypeForAcquisitionsTemplate(subjectType);
      });
  }

  getFields(): FormlyFieldConfig[] {
    return this.getDeepSkyFields().concat(this.getSolarSystemFields(), this.getUnsupportedSubjectTypeFields());
  }

  getDeepSkyFields(): FormlyFieldConfig[] {
    return [
      {
        key: "deepSkyAcquisitions",
        type: "table",
        hideExpression: () => {
          if (!this.imageEditService.model.overrideAcquisitionForm) {
            return !this.imageEditService.isDeepSky();
          }

          return this.imageEditService.model.overrideAcquisitionForm !== AcquisitionForm.LONG_EXPOSURE;
        },
        props: {
          required: false,
          label: this.translateService.instant("Long exposure acquisition sessions"),
          addLabel: this.translateService.instant("Add session"),
          additionalPropertiesClicked: (index: number) => {
            const modalRef: NgbModalRef = this.modalService.open(AdditionalDeepSkyAcquisitionPropertiesModalComponent, {
              backdrop: "static"
            });
            const componentInstance: AdditionalDeepSkyAcquisitionPropertiesModalComponent = modalRef.componentInstance;
            componentInstance.imageEditService = this.imageEditService;
            componentInstance.fieldGroup = this.getAdditionalDeepSkyFields();
            componentInstance.index = index;
          },
          additionalButtonsTemplate: this.acquisitionAdditionalButtonsTemplate,
          excludeFromCountNonNullProperties: [
            "date",
            "filter2",
            "number",
            "duration",
            "id",
            "image",
            "filter",
            "savedOn",
            "advanced"
          ]
        },
        fieldArray: {
          fieldGroup: [
            this._getDateField(),
            this._getFilterField(),
            this._getNumberField(),
            this._getDurationField(),
            {
              fieldGroup: this.getAdditionalDeepSkyFields(),
              props: {
                hide: true
              }
            }
          ]
        }
      }
    ];
  }

  getAdditionalDeepSkyFields(): FormlyFieldConfig[] {
    return [
      {
        key: "isSynthetic",
        type: "checkbox",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Synthetic channel"),
          required: false
        }
      },
      {
        wrappers: ["card-wrapper"],
        hideExpression: "model.isSynthetic",
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
            },
            validators: {
              validation: ["whole-number"]
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
              label: "Gain",
              required: false,
              step: 1,
              min: -99999.99,
              max: 99999.99
            },
            validators: {
              validation: [
                "number",
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
            key: "sensorCooling",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Cooling"),
              description: this.translateService.instant("The temperature of the chip in Celsius degrees, e.g. -20."),
              required: false,
              step: 1,
              min: -274,
              max: 100
            },
            validators: {
              validation: ["whole-number"]
            }
          }
        ]
      },
      {
        wrappers: ["card-wrapper"],
        hideExpression: "model.isSynthetic",
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
            },
            validators: {
              validation: [
                "number",
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
      },
      {
        wrappers: ["card-wrapper"],
        hideExpression: "model.isSynthetic",
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
            },
            validators: {
              validation: ["whole-number"]
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
              label: this.translateService.instant("Flat darks"),
              description: this.translateService.instant("The number of flat dark frames."),
              required: false,
              step: 1,
              min: 0
            },
            validators: {
              validation: ["whole-number"]
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
            },
            validators: {
              validation: ["whole-number"]
            }
          }
        ]
      },
      {
        wrappers: ["card-wrapper"],
        hideExpression: "model.isSynthetic",
        templateOptions: {
          label: "Sky/Ambient conditions"
        },
        fieldGroup: [
          {
            key: "bortle",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            props: {
              label: this.translateService.instant("Bortle dark-sky scale"),
              description: this.translateService.instant(
                "Quality of the sky according to <a href=\"http://en.wikipedia.org/wiki/Bortle_Dark-Sky_Scale\" target=\"_blank\">the Bortle Scale</a>."
              ),
              required: false,
              options: [
                { value: BortleScale.ONE, label: this.translateService.instant("1 - Excellent dark-site sky (BLACK)") },
                { value: BortleScale.TWO, label: this.translateService.instant("2 - Typical truly dark site (GRAY)") },
                { value: BortleScale.THREE, label: this.translateService.instant("3 - Rural sky (BLUE)") },
                {
                  value: BortleScale.FOUR,
                  label: this.translateService.instant("4 - Rural/suburban transition (GREEN/YELLOW)")
                },
                {
                  value: BortleScale.FOUR_POINT_FIVE,
                  label: this.translateService.instant("4.5 - Semi-Suburban/Transition sky (YELLOW)")
                },
                { value: BortleScale.FIVE, label: this.translateService.instant("5 - Suburban sky (ORANGE)") },
                { value: BortleScale.SIX, label: this.translateService.instant("6 - Bright suburban sky (RED)") },
                {
                  value: BortleScale.SEVEN,
                  label: this.translateService.instant("7 - Suburban/urban transition or Full Moon (RED)")
                },
                { value: BortleScale.EIGHT, label: this.translateService.instant("8 - City sky (WHITE)") },
                { value: BortleScale.NINE, label: this.translateService.instant("9 - Inner city sky (WHITE)") }
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
              description: this.translateService.instant(
                "Mean SQM mag/arcsec^2 as measured by your Sky Quality Meter."
              ),
              required: false,
              step: 1,
              min: 0
            },
            validators: {
              validation: [
                "number",
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
            key: "meanFwhm",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Mean FWHM"),
              description: this.translateService.instant(
                "Mean Full Width at Half Maximum in arc seconds, a measure of seeing."
              ),
              required: false,
              step: 1,
              min: 0
            },
            validators: {
              validation: [
                "number",
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
            key: "temperature",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: this.translateService.instant("Temperature"),
              description: this.translateService.instant("Ambient temperature in Celsius degrees."),
              required: false,
              step: 1,
              min: -88, // Minimum temperature ever recorded on Earth.
              max: 58 // Maximum temperature ever recorded on Earth.
            },
            validators: {
              validation: [
                "number",
                {
                  name: "min-value",
                  options: {
                    minValue: -88
                  }
                },
                {
                  name: "max-value",
                  options: {
                    maxValue: 58
                  }
                },
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

  getSolarSystemFields(): FormlyFieldConfig[] {
    return [
      {
        key: "solarSystemAcquisitions",
        type: "table",
        hideExpression: () => {
          if (!this.imageEditService.model.overrideAcquisitionForm) {
            return !this.imageEditService.isSolarSystem();
          }

          return this.imageEditService.model.overrideAcquisitionForm !== AcquisitionForm.VIDEO_BASED;
        },
        props: {
          required: false,
          label: this.translateService.instant("Video based acquisition sessions"),
          addLabel: this.translateService.instant("Add session"),
          maxRows: 1,
          additionalPropertiesClicked: (index: number) => {
            const modalRef: NgbModalRef = this.modalService.open(
              AdditionalSolarSystemAcquisitionPropertiesModalComponent,
              {
                backdrop: "static"
              }
            );
            const componentInstance: AdditionalSolarSystemAcquisitionPropertiesModalComponent =
              modalRef.componentInstance;
            componentInstance.imageEditService = this.imageEditService;
            componentInstance.fieldGroup = this.getAdditionalSolarSystemFields();
            componentInstance.index = index;
          },
          additionalButtonsTemplate: this.acquisitionAdditionalButtonsTemplate,
          excludeFromCountNonNullProperties: [
            "id",
            "date",
            "time",
            "image",
            "frames",
            "fps",
            "exposurePerFrame",
            "savedOn"
          ]
        },
        fieldArray: {
          fieldGroup: [
            this._getDateField(),
            this._getTimeField(),
            this._getFramesField(),
            this._getFPSField(),
            this._getExposurePerFrame(),
            {
              fieldGroup: this.getAdditionalSolarSystemFields(),
              props: {
                hide: true
              }
            }
          ]
        }
      }
    ];
  }

  getAdditionalSolarSystemFields(): FormlyFieldConfig[] {
    return [
      {
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
        wrappers: ["card-wrapper"],
        templateOptions: {
          label: this.translateService.instant("Camera")
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
            },
            validators: {
              validation: ["whole-number"]
            }
          },
          {
            key: "gain",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: "number",
              label: "Gain",
              required: false,
              step: 1,
              min: -99999.99,
              max: 99999.99
            },
            validators: {
              validation: [
                "number",
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
      },
      {
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
              description: this.translateService.instant("Your estimation of the seeing."),
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
              description: this.translateService.instant("Your estimation of the transparency."),
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
                "number",
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
                "number",
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
                "number",
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

  getUnsupportedSubjectTypeFields(): FormlyFieldConfig[] {
    const subjectType: string = this.imageEditService.humanizeSubjectType(this.imageEditService.model.subjectType);
    const message: string = this.translateService.instant(
      "The subject type \"{{0}}\" does not support acquisition sessions.",
      {
        0: subjectType
      }
    );

    return [
      {
        className: "section-label",
        template: `<p>${message}</p>`,
        hideExpression: () => this.imageEditService.isDeepSky() || this.imageEditService.isSolarSystem(),
        key: "unsupportedSubjectTypeForAcquisitions",
        props: {
          required: false
        }
      }
    ];
  }

  private _getUnsupportedSubjectTypeForAcquisitionsTemplate(subjectType: SubjectType): string {
    const value: string = this.imageEditService.humanizeSubjectType(subjectType);
    const message: string = this.translateService.instant(
      "The subject type \"{{0}}\" does not support acquisition sessions.",
      {
        0: value
      }
    );

    return `<p>${message}</p>`;
  }

  private _getDateField(): FormlyFieldConfig {
    const supportsDateInput = this.utilsService.supportsDateInput();

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    return {
      key: "date",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: supportsDateInput ? "date" : "text",
        label: this.translateService.instant("Date"),
        description: this.translateService.instant("Acquisition date."),
        required: false,
        placeholder: supportsDateInput ? "" : "YYYY-MM-DD"
      },
      validators: {
        validation: [
          {
            name: "is-date",
            options: {
              format: supportsDateInput ? UtilsService.getDateFormatString() : "YYYY-MM-DD"
            }
          },
          {
            name: "min-date",
            options: {
              value: new Date(1000, 0, 1)
            }
          },
          {
            name: "max-date",
            options: {
              value: now
            }
          }
        ]
      }
    };
  }

  private _getFilterField(): FormlyFieldConfig {
    return {
      key: "filter2",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        label: this.translateService.instant("Filter"),
        description:
          this.translateService.instant("Filter used.") +
          " " +
          this.translateService.instant("To add more, go back to the Equipment step."),
        clearable: true,
        searchable: false,
        footerTemplateExtra: this.acquisitionFilterSelectFooterTemplateExtra,
        options: this.store$.select(selectEquipmentItems).pipe(
          takeUntil(this.destroyed$),
          map(items =>
            items.filter(
              item =>
                item.klass === EquipmentItemType.FILTER && this.imageEditService.model.filters2.indexOf(item.id) > -1
            )
          ),
          map(items =>
            items.map(item => ({
              value: item.id,
              label: `${item.brandName} ${item.name}`
            }))
          ),
          map(items => UtilsService.sortObjectsByProperty(items, "label")),
          distinctUntilChangedObj()
        ),
        appendTo: "body"
      }
    };
  }

  private _getNumberField(): FormlyFieldConfig {
    return {
      key: "number",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("Number"),
        description: this.translateService.instant("Number of frames."),
        required: true,
        step: 1,
        min: 1
      },
      validators: {
        validation: ["number", "whole-number"]
      }
    };
  }

  private _getDurationField(): FormlyFieldConfig {
    return {
      key: "duration",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("Duration"),
        description: this.translateService.instant("Duration of each frame in seconds."),
        required: true,
        step: 1,
        min: 0.0001,
        max: 999999.9999
      },
      validators: {
        validation: [
          "number",
          {
            name: "max-decimals",
            options: {
              value: 4
            }
          }
        ]
      }
    };
  }

  private _getTimeField(): FormlyFieldConfig {
    return {
      key: "time",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "time",
        label: this.translateService.instant("Time"),
        description: this.translateService.instant("Acquisition time (local timezone)."),
        required: false
      }
    };
  }

  private _getFramesField(): FormlyFieldConfig {
    return {
      key: "frames",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("Frames"),
        description: this.translateService.instant("Number of frames."),
        required: false,
        step: 1,
        min: 1
      },
      validators: {
        validation: ["whole-number"]
      }
    };
  }

  private _getFPSField(): FormlyFieldConfig {
    return {
      key: "fps",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("FPS"),
        description: this.translateService.instant("Frames per second."),
        required: false,
        step: 1,
        min: 0.00001
      },
      validators: {
        validation: [
          "number",
          {
            name: "max-decimals",
            options: {
              value: 5
            }
          }
        ]
      }
    };
  }

  private _getExposurePerFrame(): FormlyFieldConfig {
    return {
      key: "exposurePerFrame",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("Exposure per frame") + " ms",
        required: false,
        step: 1,
        min: 0.01,
        max: 99999.99
      },
      validators: {
        validation: [
          "number",
          {
            name: "max-decimals",
            options: {
              value: 2
            }
          }
        ]
      }
    };
  }
}
