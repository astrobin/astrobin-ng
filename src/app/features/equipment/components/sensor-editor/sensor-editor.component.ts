import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseEquipmentItemEditorComponent } from "@features/equipment/components/base-equipment-item-editor/base-equipment-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-sensor-editor",
  templateUrl: "./sensor-editor.component.html",
  styleUrls: [
    "./sensor-editor.component.scss",
    "../base-equipment-item-editor/base-equipment-item-editor.component.scss"
  ]
})
export class SensorEditorComponent extends BaseEquipmentItemEditorComponent<SensorInterface>
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
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(
      store$,
      actions$,
      loadingService,
      translateService,
      windowRefService,
      equipmentApiService,
      equipmentItemService
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
          "templateOptions.disabled": () => this.brandCreation.inProgress
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
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Number of pixels across the X axis")
        }
      },
      {
        key: "pixelHeight",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-pixel-height",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Number of pixels across the Y axis")
        }
      },
      {
        key: "sensorWidth",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-sensor-width",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 0.1,
          step: 0.1,
          label: this.translateService.instant("Sensor width (in mm)")
        }
      },
      {
        key: "sensorHeight",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-sensor-height",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 0.1,
          step: 0.1,
          label: this.translateService.instant("Sensor height (in mm)")
        }
      },
      {
        key: "quantumEfficiency",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-quantum-efficiency",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 0,
          max: 100,
          step: 0.1,
          label: this.translateService.instant("Quantum efficiency (in %)")
        }
      },
      {
        key: "fullWellCapacity",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-full-well-capacity",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Full well capacity (in e-)")
        }
      },
      {
        key: "readNoise",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-read-noise",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Read noise (in e-)")
        }
      },
      {
        key: "frameRate",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-frame-rate",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Frame rate (in FPS)")
        }
      },
      {
        key: "adc",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "sensor-field-adc",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("ADC (in bits)"),
          description: this.translateService.instant("Analog to Digital Converter")
        }
      },
      {
        key: "colorOrMono",
        type: "checkbox",
        id: "sensor-field-color-or-mono",
        defaultValue: false,
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          label: this.translateService.instant("Color"),
          description: this.translateService.instant(
            "Tick if this is a color sensor, leave blank if it's a monochromatic one."
          )
        }
      },
      this._getImageField()
    ];
  }
}
