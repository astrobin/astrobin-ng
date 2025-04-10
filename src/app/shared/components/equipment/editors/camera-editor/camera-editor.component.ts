import type { ChangeDetectorRef, OnInit, TemplateRef } from "@angular/core";
import { Component, ViewChild } from "@angular/core";
import type { AbstractControl, FormControl } from "@angular/forms";
import type { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { FormlyFieldService } from "@core/services/formly-field.service";
import type { LoadingService } from "@core/services/loading.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { CameraDisplayProperty } from "@features/equipment/services/camera.service";
import type { CameraService } from "@features/equipment/services/camera.service";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { CameraType } from "@features/equipment/types/camera.interface";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { SensorInterface } from "@features/equipment/types/sensor.interface";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import {
  BaseItemEditorComponent,
  EquipmentItemEditorMode
} from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { Constants } from "@shared/constants";
import { isGroupMember } from "@shared/operators/is-group-member.operator";
import { of } from "rxjs";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";

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
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly cameraService: CameraService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly sanitizer: DomSanitizer
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
      changeDetectorRef,
      classicRoutesService,
      sanitizer
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
    this.options.formState.subCreation.inProgress = true;
    this.subCreationInProgress.emit(true);
    this.windowRefService.scrollToElement("astrobin-sensor-editor");
  }

  endSensorCreation() {
    this.options.formState.subCreation.inProgress = false;
    this.options.formState.subCreation.model = {};
    this.options.formState.subCreation.form.reset();
    this.subCreationInProgress.emit(false);

    this.utilsService.delay(250).subscribe(() => {
      this.windowRefService.scrollToElement("#camera-field-sensor");
    });
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
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

    let hasCanonMultiName = false;

    for (const word of canonMultiNameWords) {
      if (value.toLowerCase() === word) {
        hasCanonMultiName = true;
        break;
      }
    }

    if (hasCanonMultiName) {
      field.formControl.setErrors({ "has-canon-multi-name": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    }

    if (
      !!this.model.brand &&
      value &&
      (value.toLowerCase().indexOf("mgen") > -1 || value.toLowerCase().indexOf("m-gen") > -1)
    ) {
      this.store$
        .select(selectBrand, this.model.brand)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          if (brand.name === "Lacerta") {
            field.formControl.setErrors({ "has-lacerta-mgen-in-wrong-class": true });
            field.formControl.markAsTouched();
            field.formControl.markAsDirty();
          }
        });
    }

    this.equipmentItemService.hasOagInWrongClassError(field, value);
  }

  private _initFields() {
    const _doInitFields = () => {
      this.currentUser$.pipe(take(1), isGroupMember(Constants.EQUIPMENT_MODERATORS_GROUP)).subscribe(isModerator => {
        if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision || isModerator) {
          this.fields = [
            this._getDIYField(),
            this._getBrandField(),
            this._getNameField(),
            this._getVariantOfField(EquipmentItemType.CAMERA, isModerator),
            this._getTypeField(),
            this._getSensorField(),
            this._getCooledField(),
            this._getMaxCoolingField(),
            this._getBackFocusField()
          ];
        } else {
          this.fields = [this._getNameField(), this._getVariantOfField(EquipmentItemType.CAMERA, isModerator)];

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
      });
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
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
        stockModified: {
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
                    map(brand => brand.name !== "CentralDS" && brand.name !== "EOS FOR ASTRO")
                  );
                })
              );
            }
          },
          message: this.translateService.instant(
            `As cameras from this brands are already modified, please select "Dedicated deep-sky camera"`
          )
        }
      }
    };
  }

  private _getSensorField() {
    return {
      key: "sensor",
      type: "equipment-item-browser",
      id: "camera-field-sensor",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.SENSOR),
        itemType: EquipmentItemType.SENSOR,
        quickAddRecentFromUserId: null,
        showPlaceholderImage: false,
        required: false,
        multiple: false,
        creationModeStarted: this.startSensorCreation.bind(this),
        creationModeEnded: this.endSensorCreation.bind(this),
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId: this.componentId
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
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED),
        description: this.translateService.instant("Whether this camera is equipped with a cooling mechanism."),
        required: this.editorMode === EquipmentItemEditorMode.CREATION
      }
    };
  }

  private _getMaxCoolingField() {
    return {
      key: "maxCooling",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "camera-field-max-cooling",
      hideExpression: () => !this.model.cooled,
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "camera-field-back-focus",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
        const typeField = this.form.get("type");

        if (!!typeField) {
          this.form.get("type").updateValueAndValidity({ emitEvent: false });
        }
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
