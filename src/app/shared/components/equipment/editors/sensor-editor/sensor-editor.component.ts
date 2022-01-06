import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { ColorOrMono, SensorInterface } from "@features/equipment/types/sensor.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

@Component({
  selector: "astrobin-sensor-editor",
  templateUrl: "./sensor-editor.component.html",
  styleUrls: ["./sensor-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class SensorEditorComponent extends BaseItemEditorComponent<SensorInterface, null>
  implements OnInit, AfterViewInit {
  @ViewChild("sensorOptionTemplate")
  sensorOptionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly sensorService: SensorService
  ) {
    super(
      store$,
      actions$,
      loadingService,
      translateService,
      windowRefService,
      equipmentApiService,
      equipmentItemService,
      formlyFieldService
    );
  }

  ngOnInit() {
    if (!this.returnToSelector) {
      this.returnToSelector = "#sensor-editor-form";
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initFields();
    }, 1);

    this.model.klass = EquipmentItemType.SENSOR;

    super.ngAfterViewInit();
  }

  private _initFields() {
    this.fields = [
      this._getBrandField(),
      this._getNameField(),
      {
        key: "pixelSize",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-pixel-size",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 0.1,
          label: this.translateService.instant("Pixel size (in μm)"),
          description: this.translateService.instant("The size of the individual pixels in μm.")
        },
        validators: {
          validation: [
            "number",
            {
              name: "min-value",
              options: {
                minValue: 0.1
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
      },
      {
        key: "pixelWidth",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-pixel-width",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          required: true,
          type: "number",
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXEL_WIDTH)
        },
        validators: {
          validation: [
            "whole-number",
            {
              name: "min-value",
              options: {
                minValue: 1
              }
            }
          ]
        }
      },
      {
        key: "pixelHeight",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-pixel-height",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          required: true,
          type: "number",
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXEL_HEIGHT)
        },
        validators: {
          validation: [
            "whole-number",
            {
              name: "min-value",
              options: {
                minValue: 1
              }
            }
          ]
        }
      },
      {
        key: "sensorWidth",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-sensor-width",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.SENSOR_WIDTH)
        },
        validators: {
          validation: [
            "number",
            {
              name: "min-value",
              options: {
                minValue: 0.1
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
      },
      {
        key: "sensorHeight",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-sensor-height",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.SENSOR_HEIGHT)
        },
        validators: {
          validation: [
            "number",
            {
              name: "min-value",
              options: {
                minValue: 0.1
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
      },
      {
        key: "quantumEfficiency",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-quantum-efficiency",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.QUANTUM_EFFICIENCY)
        },
        validators: {
          validation: [
            "number",
            {
              name: "min-value",
              options: {
                minValue: 0.1
              }
            },
            {
              name: "max-value",
              options: {
                maxValue: 100
              }
            }
          ]
        }
      },
      {
        key: "fullWellCapacity",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-full-well-capacity",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FULL_WELL_CAPACITY)
        },
        validators: {
          validation: [
            "whole-number",
            {
              name: "min-value",
              options: {
                minValue: 1
              }
            }
          ]
        }
      },
      {
        key: "readNoise",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-read-noise",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.READ_NOISE)
        },
        validators: {
          validation: [
            "number",
            {
              name: "min-value",
              options: {
                minValue: 0.1
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
      },
      {
        key: "frameRate",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-frame-rate",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FRAME_RATE)
        },
        validators: {
          validation: [
            "whole-number",
            {
              name: "min-value",
              options: {
                minValue: 1
              }
            }
          ]
        }
      },
      {
        key: "adc",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-adc",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.ADC),
          description: this.translateService.instant("Analog to Digital Converter")
        },
        validators: {
          validation: [
            "whole-number",
            {
              name: "min-value",
              options: {
                minValue: 1
              }
            }
          ]
        }
      },
      {
        key: "colorOrMono",
        type: "ng-select",
        id: "sensor-field-color-or-mono",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.COLOR_OR_MONO),
          options: [
            {
              label: this.translateService.instant("Color"),
              value: ColorOrMono.C
            },
            {
              label: this.translateService.instant("Mono"),
              value: ColorOrMono.M
            }
          ]
        }
      },
      this._getImageField(),
      this._getWebsiteField()
    ];

    this._addBaseItemEditorFields();
  }
}
