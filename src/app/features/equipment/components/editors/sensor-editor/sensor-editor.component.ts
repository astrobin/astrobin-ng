import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseItemEditorComponent } from "@features/equipment/components/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { ColorOrMono, SensorInterface } from "@features/equipment/types/sensor.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";

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
          min: 0.1,
          step: 0.1,
          label: this.translateService.instant("Pixel size (in μm)"),
          description: this.translateService.instant("The size of the individual pixels in μm.")
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
          min: 1,
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXEL_WIDTH)
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
          min: 1,
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXEL_WIDTH)
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
          min: 0.1,
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.SENSOR_WIDTH)
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
          min: 0.1,
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.SENSOR_HEIGHT)
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
          min: 0,
          max: 100,
          step: 0.1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.QUANTUM_EFFICIENCY)
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
          min: 1,
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FULL_WELL_CAPACITY)
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
          min: 1,
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.READ_NOISE)
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
          min: 1,
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FRAME_RATE)
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
          min: 1,
          step: 1,
          label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.ADC),
          description: this.translateService.instant("Analog to Digital Converter")
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
          description: this.translateService.instant(
            "Tick if this is a color sensor, leave blank if it's a monochromatic one."
          ),
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
      this._getImageField()
    ];

    this._addBaseItemEditorFields();
  }
}
