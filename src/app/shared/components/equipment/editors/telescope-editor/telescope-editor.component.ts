import type { ChangeDetectorRef, OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { FormlyFieldService } from "@core/services/formly-field.service";
import { FormlyFieldMessageLevel } from "@core/services/formly-field.service";
import type { LoadingService } from "@core/services/loading.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import type { TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeDisplayProperty } from "@features/equipment/services/telescope.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";
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
import { switchMap, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-telescope-editor",
  templateUrl: "./telescope-editor.component.html",
  styleUrls: ["./telescope-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class TelescopeEditorComponent extends BaseItemEditorComponent<TelescopeInterface, null> implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly telescopeService: TelescopeService,
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
      this.returnToSelector = "#telescope-editor-form";
    }

    this.model.klass = EquipmentItemType.TELESCOPE;
    this._initFields();
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string): void {
    if (value.toLowerCase().indexOf("hyperstar") > -1) {
      field.formControl.setErrors({ "has-hyperstar-in-wrong-class": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    } else if (value.toLowerCase().indexOf("teleconverter") > -1) {
      field.formControl.setErrors({ "has-teleconverter-in-wrong-class": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    } else if (
      value.toLowerCase().indexOf("reducer") > -1 ||
      value.toLowerCase().indexOf("flattener") > -1 ||
      value.toLowerCase().indexOf("corrector") > -1 ||
      value.toLowerCase().indexOf("extender") > -1 ||
      value.toLowerCase().indexOf("barlow") > -1
    ) {
      field.formControl.setErrors({ "has-focal-modifier-in-wrong-class": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    } else if (value.toLowerCase().indexOf("skywatcher") > -1) {
      field.formControl.setErrors({ "has-skywatcher-without-dash": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    }

    this.equipmentItemService.hasOagInWrongClassError(field, value);
  }

  private _initFields() {
    this.initBrandAndName()
      .pipe(switchMap(() => this.currentUser$.pipe(take(1), isGroupMember(Constants.EQUIPMENT_MODERATORS_GROUP))))
      .subscribe(isModerator => {
        if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision || isModerator) {
          this.fields = [
            this._getDIYField(),
            this._getBrandField(),
            this._getNameField(),
            this._getVariantOfField(EquipmentItemType.TELESCOPE, isModerator),
            this._getTypeField(),
            this._getApertureField(),
            this._getFixedFocalLengthField(),
            this._getFocalLengthField(),
            this._getFocalLengthMinMaxField(),
            this._getWeightField()
          ];
        } else {
          this.fields = [this._getNameField(), this._getVariantOfField(EquipmentItemType.TELESCOPE, isModerator)];

          if (this.model.type === null || this.model.type === TelescopeType.OTHER) {
            this.fields.push(this._getTypeField());
          }

          if (!this.model.aperture) {
            this.fields.push(this._getApertureField());
          }

          if (!this.model.minFocalLength || !this.model.maxFocalLength) {
            this.fields = [
              ...this.fields,
              this._getFixedFocalLengthField(),
              this._getFocalLengthField(),
              this._getFocalLengthMinMaxField()
            ];
          }

          if (!this.model.weight) {
            this.fields.push(this._getWeightField());
          }
        }

        this.fields = [...this.fields, this._getImageField(), this._getWebsiteField(), this._getCommunityNotesField()];

        this._addBaseItemEditorFields();
      });
  }

  private _getTypeField() {
    return {
      key: "type",
      type: "ng-select",
      id: "telescope-field-type",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.TYPE),
        required: true,
        clearable: true,
        options: Object.keys(TelescopeType).map(telescopeType => ({
          value: TelescopeType[telescopeType],
          label: this.telescopeService.humanizeType(TelescopeType[telescopeType])
        }))
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
            const nameField = this.fields.find(f => f.key === "name");
            this.formlyFieldService.clearMessages(nameField, "lensNamingConvention");
            if (value === TelescopeType.CAMERA_LENS) {
              this.formlyFieldService.addMessage(nameField, {
                scope: "cameraLensInfo",
                level: FormlyFieldMessageLevel.INFO,
                text: this.translateService.instant(
                  "The recommended naming convention for camera lenses is: optional model name, focal length " +
                    "range, f-ratio range, additional properties. E.g. <strong>Nikkor Z 28mm f/2.8 (SE)</strong>."
                )
              });
            } else {
              this.formlyFieldService.clearMessages(nameField, "cameraLensInfo");
            }
          });
        }
      }
    };
  }

  private _getApertureField() {
    return {
      key: "aperture",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "telescope-field-aperture",
      hideExpression: () => this.model.type === TelescopeType.CAMERA_LENS,
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        step: 0.1,
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.APERTURE)
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

  private _getFixedFocalLengthField() {
    return {
      key: "fixedFocalLength",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "telescope-field-fixed-focal-length",
      defaultValue: this.model.minFocalLength === this.model.maxFocalLength,
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        label: this.translateService.instant("Fixed focal length")
      }
    };
  }

  private _getFocalLengthField() {
    return {
      key: "focalLength",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "telescope-field-focal-length",
      defaultValue: this.model.minFocalLength === this.model.maxFocalLength ? this.model.minFocalLength : null,
      hideExpression: () => !this.form.get("fixedFocalLength").value,
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        step: 0.1,
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.FOCAL_LENGTH)
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
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
            this.model.minFocalLength = value;
            this.model.maxFocalLength = value;
          });
        }
      }
    };
  }

  private _getFocalLengthMinMaxField() {
    return {
      fieldGroupClassName: "row",
      fieldGroup: [
        {
          className: "col-12 col-lg-6",
          key: "minFocalLength",
          type: "custom-number",
          wrappers: ["default-wrapper"],
          id: "telescope-field-min-focal-length",
          defaultValue: this.model.minFocalLength,
          hideExpression: () => !!this.form.get("fixedFocalLength").value,
          expressions: {
            "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress",
            "props.required": "!model.fixedFocalLength"
          },
          props: {
            step: 0.1,
            label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.MIN_FOCAL_LENGTH)
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
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                this.utilsService.delay(1).subscribe(() => {
                  this.form.get("maxFocalLength")?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                });
              });
            }
          }
        },
        {
          className: "col-12 col-lg-6",
          key: "maxFocalLength",
          type: "custom-number",
          wrappers: ["default-wrapper"],
          id: "telescope-field-max-focal-length",
          defaultValue: this.model.maxFocalLength,
          hideExpression: () => !!this.form.get("fixedFocalLength").value,
          expressions: {
            "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress",
            "props.required": "!model.fixedFocalLength"
          },
          props: {
            step: 0.1,
            label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.MAX_FOCAL_LENGTH)
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
              },
              {
                name: "max-greater-equal-than-min",
                options: {
                  model: this.model,
                  minValueKey: "minFocalLength",
                  minLabel: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.MIN_FOCAL_LENGTH),
                  maxLabel: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.MAX_FOCAL_LENGTH)
                }
              }
            ]
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                this.utilsService.delay(1).subscribe(() => {
                  this.form.get("minFocalLength")?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                });
              });
            }
          }
        }
      ]
    };
  }

  private _getWeightField() {
    return {
      key: "weight",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "telescope-field-weight",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        step: 0.1,
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.WEIGHT)
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
}
