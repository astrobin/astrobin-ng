import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { takeUntil } from "rxjs/operators";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-telescope-editor",
  templateUrl: "./telescope-editor.component.html",
  styleUrls: ["./telescope-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class TelescopeEditorComponent extends BaseItemEditorComponent<TelescopeInterface, null> implements OnInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly telescopeService: TelescopeService,
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
    if (!this.returnToSelector) {
      this.returnToSelector = "#telescope-editor-form";
    }

    this.model.klass = EquipmentItemType.TELESCOPE;
    this._initFields();
  }

  private _initFields() {
    this.initBrandAndName().subscribe(() => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(),
        this._getNameField(),
        this._getVariantOfField(EquipmentItemType.TELESCOPE),
        {
          key: "type",
          type: "ng-select",
          id: "telescope-field-type",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
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
                this.formlyFieldService.clearMessages(nameField.templateOptions);
                if (value === TelescopeType.CAMERA_LENS) {
                  this.formlyFieldService.addMessage(nameField.templateOptions, {
                    level: FormlyFieldMessageLevel.INFO,
                    text: this.translateService.instant(
                      "The recommended naming convention for camera lenses is: optional model name, focal length " +
                        "range, f-ratio range, additional properties. E.g. <strong>Nikkor Z 28mm f/2.8 (SE)</strong>."
                    )
                  });
                }
              });
            }
          }
        },
        {
          key: "aperture",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "telescope-field-aperture",
          hideExpression: () => this.model.type === TelescopeType.CAMERA_LENS,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            type: "number",
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
        },
        {
          key: "fixedFocalLength",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "telescope-field-fixed-focal-length",
          defaultValue: this.model.minFocalLength === this.model.maxFocalLength,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.translateService.instant("Fixed focal length")
          }
        },
        {
          key: "focalLength",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "telescope-field-focal-length",
          defaultValue: this.model.minFocalLength === this.model.maxFocalLength ? this.model.minFocalLength : null,
          hideExpression: () => !this.form.get("fixedFocalLength").value,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            type: "number",
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
        },
        {
          fieldGroupClassName: "row",
          fieldGroup: [
            {
              className: "col-12 col-lg-6",
              key: "minFocalLength",
              type: "input",
              wrappers: ["default-wrapper"],
              id: "telescope-field-min-focal-length",
              defaultValue: this.model.minFocalLength,
              hideExpression: () => !!this.form.get("fixedFocalLength").value,
              expressionProperties: {
                "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress,
                "templateOptions.required": model => !model.fixedFocalLength
              },
              templateOptions: {
                type: "number",
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
              type: "input",
              wrappers: ["default-wrapper"],
              id: "telescope-field-max-focal-length",
              defaultValue: this.model.maxFocalLength,
              hideExpression: () => !!this.form.get("fixedFocalLength").value,
              expressionProperties: {
                "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress,
                "templateOptions.required": model => !model.fixedFocalLength
              },
              templateOptions: {
                type: "number",
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
                      minLabel: this.telescopeService.getPrintablePropertyName(
                        TelescopeDisplayProperty.MIN_FOCAL_LENGTH
                      ),
                      maxLabel: this.telescopeService.getPrintablePropertyName(
                        TelescopeDisplayProperty.MAX_FOCAL_LENGTH
                      )
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
        },
        {
          key: "weight",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "telescope-field-weight",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            type: "number",
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
        },
        this._getImageField(),
        this._getWebsiteField(),
        this._getCommunityNotesField()
      ];

      this._addBaseItemEditorFields();
    });
  }
}
