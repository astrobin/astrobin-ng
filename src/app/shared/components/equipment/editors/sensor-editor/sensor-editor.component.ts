import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  BaseItemEditorComponent,
  EquipmentItemEditorMode
} from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { ColorOrMono, SensorInterface } from "@features/equipment/types/sensor.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UtilsService } from "@shared/services/utils/utils.service";
import { switchMap, take } from "rxjs/operators";
import { isGroupMember } from "@shared/operators/is-group-member.operator";
import { Constants } from "@shared/constants";

@Component({
  selector: "astrobin-sensor-editor",
  templateUrl: "./sensor-editor.component.html",
  styleUrls: ["./sensor-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class SensorEditorComponent extends BaseItemEditorComponent<SensorInterface, null> implements OnInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly sensorService: SensorService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(
      store$,
      actions$,
      loadingService,
      translateService,
      windowRefService,
      equipmentApiService,
      equipmentItemService,
      formlyFieldService,
      modalService,
      utilsService,
      changeDetectorRef
    );
  }

  ngOnInit() {
    super.ngOnInit();

    if (!this.returnToSelector) {
      this.returnToSelector = "#sensor-editor-form";
    }

    this.model.klass = EquipmentItemType.SENSOR;
    this._initFields();
  }

  private _initFields() {
    this.initBrandAndName()
      .pipe(switchMap(() => this.currentUser$.pipe(take(1), isGroupMember(Constants.EQUIPMENT_MODERATORS_GROUP))))
      .subscribe(isModerator => {
        if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision || isModerator) {
          this.fields = [
            this._getBrandField(),
            this._getNameField(),
            this._getVariantOfField(EquipmentItemType.SENSOR),
            this._getPixelSizeField(),
            this._getPixelWidthField(),
            this._getPixelHeightField(),
            this._getSensorWidthField(),
            this._getSensorHeightField(),
            this._getQuantumEfficiencyField(),
            this._getFullWellCapacityField(),
            this._getReadNoiseField(),
            this._getFrameRateField(),
            this._getAdcField(),
            this._getColorOrMonoField()
          ];
        } else {
          this.fields = [this._getNameField(), this._getVariantOfField(EquipmentItemType.SENSOR)];

          if (!this.model.pixelSize) {
            this.fields.push(this._getPixelSizeField());
          }

          if (!this.model.pixelWidth) {
            this.fields.push(this._getPixelWidthField());
          }

          if (!this.model.pixelHeight) {
            this.fields.push(this._getPixelHeightField());
          }

          if (!this.model.sensorWidth) {
            this.fields.push(this._getSensorWidthField());
          }

          if (!this.model.sensorHeight) {
            this.fields.push(this._getSensorHeightField());
          }

          if (!this.model.quantumEfficiency) {
            this.fields.push(this._getQuantumEfficiencyField());
          }

          if (!this.model.fullWellCapacity) {
            this.fields.push(this._getFullWellCapacityField());
          }

          if (!this.model.readNoise) {
            this.fields.push(this._getReadNoiseField());
          }

          if (!this.model.frameRate) {
            this.fields.push(this._getFrameRateField());
          }

          if (!this.model.adc) {
            this.fields.push(this._getAdcField());
          }

          if (!this.model.colorOrMono) {
            this.fields.push(this._getColorOrMonoField());
          }
        }

        this.fields = [...this.fields, this._getImageField(), this._getWebsiteField(), this._getCommunityNotesField()];

        this._addBaseItemEditorFields();
      });
  }

  private _getPixelSizeField() {
    return {
      key: "pixelSize",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-pixel-size",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getPixelWidthField() {
    return {
      key: "pixelWidth",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-pixel-width",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        required: true,
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
    };
  }

  private _getPixelHeightField() {
    return {
      key: "pixelHeight",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-pixel-height",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        required: true,
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
    };
  }

  private _getSensorWidthField() {
    return {
      key: "sensorWidth",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-sensor-width",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getSensorHeightField() {
    return {
      key: "sensorHeight",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-sensor-height",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getQuantumEfficiencyField() {
    return {
      key: "quantumEfficiency",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-quantum-efficiency",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getFullWellCapacityField() {
    return {
      key: "fullWellCapacity",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-full-well-capacity",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        step: 0.1,
        label: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FULL_WELL_CAPACITY)
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
    };
  }

  private _getReadNoiseField() {
    return {
      key: "readNoise",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-read-noise",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getFrameRateField() {
    return {
      key: "frameRate",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-frame-rate",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getAdcField() {
    return {
      key: "adc",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "sensor-field-adc",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }

  private _getColorOrMonoField() {
    return {
      key: "colorOrMono",
      type: "ng-select",
      id: "sensor-field-color-or-mono",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
    };
  }
}
