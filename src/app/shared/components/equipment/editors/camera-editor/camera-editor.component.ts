import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  BaseItemEditorComponent,
  EquipmentItemEditorMode
} from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { FormlyFieldEquipmentItemBrowserMode } from "@shared/components/misc/formly-field-equipment-item-browser/formly-field-equipment-item-browser.component";

@Component({
  selector: "astrobin-camera-editor",
  templateUrl: "./camera-editor.component.html",
  styleUrls: ["./camera-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class CameraEditorComponent extends BaseItemEditorComponent<CameraInterface, SensorInterface>
  implements OnInit, AfterViewInit {
  @ViewChild("sensorLabelTemplate")
  sensorLabelTemplate: TemplateRef<any>;

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
    public readonly cameraService: CameraService
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
      this.returnToSelector = "#camera-editor-form";
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initFields();
    }, 1);

    this.model.klass = EquipmentItemType.CAMERA;

    super.ngAfterViewInit();
  }

  startSensorCreation() {
    this.subCreation.inProgress = true;
    this.subCreationInProgress.emit(true);
    this.windowRefService.scrollToElement("astrobin-sensor-editor");
  }

  endSensorCreation() {
    this.subCreation.inProgress = false;
    this.subCreation.model = {};
    this.subCreation.form.reset();
    this.subCreationInProgress.emit(false);
  }

  private _initFields() {
    const _doInitFields = () => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(),
        this._getNameField(),
        {
          key: "type",
          type: "ng-select",
          id: "camera-field-type",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.TYPE),
            required: true,
            clearable: true,
            options: [
              [CameraType.DEDICATED_DEEP_SKY, this.cameraService.humanizeType(CameraType.DEDICATED_DEEP_SKY)],
              [CameraType.DSLR_MIRRORLESS, this.cameraService.humanizeType(CameraType.DSLR_MIRRORLESS)],
              [CameraType.GUIDER_PLANETARY, this.cameraService.humanizeType(CameraType.GUIDER_PLANETARY)],
              [CameraType.VIDEO, this.cameraService.humanizeType(CameraType.VIDEO)],
              [CameraType.FILM, this.cameraService.humanizeType(CameraType.FILM)],
              [CameraType.OTHER, this.cameraService.humanizeType(CameraType.OTHER)]
            ].map(item => ({
              value: item[0],
              label: item[1]
            }))
          }
        },
        {
          key: "sensor",
          type: "equipment-item-browser",
          id: "camera-field-sensor",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            mode: FormlyFieldEquipmentItemBrowserMode.ID,
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.SENSOR),
            itemType: EquipmentItemType.SENSOR,
            showQuickAddRecent: false,
            showPlaceholderImage: false,
            required: false,
            multiple: false,
            creationModeStarted: this.startSensorCreation.bind(this),
            creationModeEnded: this.endSensorCreation.bind(this),
            enableCreation: true
          }
        },
        {
          key: "cooled",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "camera-field-cooled",
          hideExpression: () => this.form.get("type").value !== CameraType.DEDICATED_DEEP_SKY,
          defaultValue: this.editorMode === EquipmentItemEditorMode.CREATION ? false : null,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED),
            description: this.translateService.instant("Whether this camera is equipped with a cooling mechanism."),
            required: this.editorMode === EquipmentItemEditorMode.CREATION
          }
        },
        {
          key: "maxCooling",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "camera-field-max-cooling",
          hideExpression: () => !this.form.get("cooled")?.value,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            type: "number",
            step: 1,
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.MAX_COOLING),
            description: this.translateService.instant(
              "A positive whole number that represents how many Celsius below ambient temperature this camera can " +
                "be cooled."
            )
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
          key: "backFocus",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "camera-field-back-focus",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            type: "number",
            step: 0.1,
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.BACK_FOCUS),
            description: this.translateService.instant("Camera back focus in mm.")
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
        this._getWebsiteField(),
        this._getImageField()
      ];

      this._addBaseItemEditorFields();
    };

    if (this.editorMode === EquipmentItemEditorMode.CREATION) {
      this.initBrandAndName().subscribe(() => {
        _doInitFields();
      });
    } else {
      _doInitFields();
    }
  }
}
