import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions, ofType } from "@ngrx/effects";
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
import { of } from "rxjs";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import {
  CreateSensor,
  EquipmentActionTypes,
  EquipmentItemCreationSuccessPayloadInterface,
  FindAllEquipmentItems,
  FindAllEquipmentItemsSuccess,
  LoadBrand
} from "@features/equipment/store/equipment.actions";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { selectBrand, selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";

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
  }

  endSensorCreation() {
    this.subCreation.inProgress = false;
    this.subCreation.model = {};
    this.subCreation.form.reset();
    this.subCreationInProgress.emit(false);
  }

  private _initFields() {
    const _doInitFields = (opts: { hasModifiedVariant?: boolean } = {}) => {
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
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.SENSOR),
            itemType: EquipmentItemType.SENSOR,
            showQuickAddRecent: false,
            showPlaceholderImage: false,
            required: false,
            multiple: false,
            creationModeStarted: this.startSensorCreation.bind(this),
            creationModeEnded: this.endSensorCreation.bind(this)
          }
        },
        {
          key: "createModifiedVariant",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "camera-field-create-modified-variant",
          defaultValue: !!opts.hasModifiedVariant,
          hideExpression: () => this.form.get("type").value !== CameraType.DSLR_MIRRORLESS || opts.hasModifiedVariant,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.CREATE_MODIFIED_VARIANT),
            description: this.translateService.instant(
              "If selected, AstroBin will automatically create a variant of this object that is labeled as " +
                "<em>modified for astrophotography</em>."
            ),
            messages: [
              {
                level: FormlyFieldMessageLevel.INFO,
                text: this.translateService.instant(
                  "Please only do this for DSLR camera that typically are modified for astrophotography. If this is a " +
                    "camera that is <em>specifically</em> sold as modified for astrophotography, e.g. the " +
                    "<strong>Canon EOS 60Da</strong> you <strong>do not</strong> need to use check this option."
                )
              }
            ]
          }
        },
        {
          key: "cooled",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "camera-field-cooled",
          defaultValue: false,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED),
            description: this.translateService.instant("Whether this camera is equipped with a cooling mechanism.")
          }
        },
        {
          key: "maxCooling",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "camera-field-max-cooling",
          hideExpression: () => !this.form.get("cooled").value,
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
      _doInitFields();
    } else if (this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL) {
      this.equipmentApiService
        .getByProperties(EquipmentItemType.CAMERA, {
          brand: this.model.brand,
          name: this.model.name,
          modified: true
        })
        .subscribe(camera => {
          _doInitFields({ hasModifiedVariant: !!camera });
        });
    }
  }
}
