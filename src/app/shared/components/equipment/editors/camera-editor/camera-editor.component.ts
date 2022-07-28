import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
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
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { of } from "rxjs";
import { AbstractControl, FormControl } from "@angular/forms";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-camera-editor",
  templateUrl: "./camera-editor.component.html",
  styleUrls: ["./camera-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class CameraEditorComponent extends BaseItemEditorComponent<CameraInterface, SensorInterface> implements OnInit {
  @ViewChild("sensorLabelTemplate")
  sensorLabelTemplate: TemplateRef<any>;

  @ViewChild("sensorOptionTemplate")
  sensorOptionTemplate: TemplateRef<any>;

  private _defaultTypeOptions = [
    [CameraType.DEDICATED_DEEP_SKY, this.cameraService.humanizeType(CameraType.DEDICATED_DEEP_SKY)],
    [CameraType.DSLR_MIRRORLESS, this.cameraService.humanizeType(CameraType.DSLR_MIRRORLESS)],
    [CameraType.GUIDER_PLANETARY, this.cameraService.humanizeType(CameraType.GUIDER_PLANETARY)],
    [CameraType.VIDEO, this.cameraService.humanizeType(CameraType.VIDEO)],
    [CameraType.FILM, this.cameraService.humanizeType(CameraType.FILM)],
    [CameraType.OTHER, this.cameraService.humanizeType(CameraType.OTHER)]
  ];

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly cameraService: CameraService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService
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
      utilsService
    );
  }

  ngOnInit() {
    super.ngOnInit();

    if (!this.returnToSelector) {
      this.returnToSelector = "#camera-editor-form";
    }

    this.model.klass = EquipmentItemType.CAMERA;
    this._initFields();
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

    this.utilsService.delay(250).subscribe(() => {
      this.windowRefService.scrollToElement("#camera-field-sensor");
    });
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    const oagWords = ["oag", "off-axis", "off axis"];
    const canonMultiNameWords = [
      "1000d",
      "eos 1000d",
      "rebel xs",
      "kiss f",
      "100d",
      "eos 100d",
      "rebel sl1",
      "kiss x7",
      "1100d",
      "eos 1100d",
      "rebel t3",
      "kiss x50",
      "1200d",
      "eos 1200d",
      "rebel t5",
      "kiss x79",
      "1300d",
      "eos 1300d",
      "rebel t6",
      "kiss x80",
      "400d",
      "eos 400d",
      "rebel xti",
      "450d",
      "eos 450d",
      "rebel xsi",
      "kiss x2",
      "500d",
      "eos 500d",
      "rebel t1i",
      "kiss x3",
      "550d",
      "eos 550d",
      "rebel t2i",
      "kiss x4",
      "600d",
      "eos 600d",
      "rebel t3i",
      "kiss x5",
      "650d",
      "eos 650d",
      "rebel t41",
      "kiss x6i",
      "700d",
      "eos 700d",
      "rebel t5i",
      "kiss x7i",
      "750d",
      "eos 750d",
      "rebel t6i",
      "kiss x8i",
      "760d",
      "eos 760d",
      "rebel t6s",
      "8000d",
      "eos 8000d",
      "800d",
      "eos 800d",
      "rebel t7i",
      "kiss x9i",
      "eos 200d",
      "kiss x9",
      "rebel sl2",
      "250d",
      "eos 250d",
      "kiss x10",
      "rebel sl3",
      "200d mark ii",
      "eos 200d mark ii"
    ];

    let hasOAG = false;
    let hasCanonMultiName = false;

    for (const word of oagWords) {
      if (value.toLowerCase().indexOf(word) > -1) {
        hasOAG = true;
        break;
      }
    }

    for (const word of canonMultiNameWords) {
      if (value.toLowerCase() === word) {
        hasCanonMultiName = true;
        break;
      }
    }

    if (hasOAG) {
      this.formlyFieldService.addMessage(field.templateOptions, {
        level: FormlyFieldMessageLevel.WARNING,
        text: this.translateService.instant("Off-axis guiders are typically found as accessories, not cameras.")
      });
    }

    if (hasCanonMultiName) {
      field.formControl.setErrors({ "has-canon-multi-name": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    }
  }

  private _initFields() {
    const _doInitFields = () => {
      if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision) {
        this.fields = [
          this._getDIYField(),
          this._getBrandField(),
          this._getNameField(),
          this._getVariantOfField(EquipmentItemType.CAMERA),
          this._getTypeField(),
          this._getSensorField(),
          this._getCooledField(),
          this._getMaxCoolingField(),
          this._getBackFocusField()
        ];
      } else {
        this.fields = [this._getNameField(), this._getVariantOfField(EquipmentItemType.CAMERA)];

        if (!this.model.type || this.model.type === CameraType.OTHER) {
          this.fields.push(this._getTypeField());
        }

        if (!this.model.sensor) {
          this.fields.push(this._getSensorField());
        }

        if (this.model.cooled === null) {
          this.fields.push(this._getCooledField());
        }

        if (!this.model.maxCooling) {
          this.fields.push(this._getMaxCoolingField());
        }

        if (!this.model.backFocus) {
          this.fields.push(this._getBackFocusField());
        }
      }

      this.fields = [...this.fields, this._getWebsiteField(), this._getImageField(), this._getCommunityNotesField()];

      this._addBaseItemEditorFields();
    };

    if (this.editorMode === EquipmentItemEditorMode.CREATION) {
      this.initBrandAndName().subscribe(() => {
        _doInitFields();
        this._initBrandValueChangesObservable();
      });
    } else {
      _doInitFields();
    }
  }

  private _getTypeField() {
    return {
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
        options: this._defaultTypeOptions.map(item => ({
          value: item[0],
          label: item[1]
        }))
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(cameraType => {
            if (cameraType === CameraType.DSLR_MIRRORLESS) {
              this.model.variantOf = null;
            }
          });
        }
      },
      asyncValidators: {
        centralDS: {
          expression: (control: FormControl) => {
            if (!control.value || control.value === CameraType.DEDICATED_DEEP_SKY) {
              return of(true);
            }

            if (control.value !== CameraType.DEDICATED_DEEP_SKY) {
              return of(this.model.brand).pipe(
                switchMap(brandId => {
                  if (!brandId) {
                    return of(true);
                  }

                  this.store$.dispatch(new LoadBrand({ id: brandId }));

                  return this.store$.select(selectBrand, brandId).pipe(
                    filter(brand => !!brand),
                    take(1),
                    map(brand => brand.name !== "CentralDS")
                  );
                })
              );
            }
          },
          message: this.translateService.instant(`For CentralDS cameras, please select "Dedicated deep-sky camera"`)
        }
      }
    };
  }

  private _getSensorField() {
    return {
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
        creationModeEnded: this.endSensorCreation.bind(this),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false
      }
    };
  }

  private _getCooledField() {
    return {
      key: "cooled",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "camera-field-cooled",
      hideExpression: () => this.model.type !== CameraType.DEDICATED_DEEP_SKY,
      defaultValue: this.editorMode === EquipmentItemEditorMode.CREATION ? false : null,
      expressionProperties: {
        "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      templateOptions: {
        label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED),
        description: this.translateService.instant("Whether this camera is equipped with a cooling mechanism."),
        required: this.editorMode === EquipmentItemEditorMode.CREATION
      }
    };
  }

  private _getMaxCoolingField() {
    return {
      key: "maxCooling",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "camera-field-max-cooling",
      hideExpression: () => !this.model.cooled,
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
    };
  }

  private _getBackFocusField() {
    return {
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
    };
  }

  private _initBrandValueChangesObservable() {
    const _doInit = (control: AbstractControl) => {
      control.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.form.get("type").updateValueAndValidity({ emitEvent: false });
      });
    };

    const brandControl: AbstractControl = this.form.get("brand");
    if (!!brandControl) {
      _doInit(brandControl);
    } else {
      this.utilsService.delay(100).subscribe(() => {
        this._initBrandValueChangesObservable();
      });
    }
  }
}
