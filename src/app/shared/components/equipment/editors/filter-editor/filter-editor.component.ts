import { AfterViewInit, Component, OnInit } from "@angular/core";
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
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterInterface, FilterSize, FilterType } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { take, takeUntil } from "rxjs/operators";
import { interval } from "rxjs";

@Component({
  selector: "astrobin-filter-editor",
  templateUrl: "./filter-editor.component.html",
  styleUrls: ["./filter-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class FilterEditorComponent extends BaseItemEditorComponent<FilterInterface, null>
  implements OnInit, AfterViewInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly filterService: FilterService,
    public readonly modalService: NgbModal
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
      modalService
    );
  }

  ngOnInit() {
    if (!this.returnToSelector) {
      this.returnToSelector = "#filter-editor-form";
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initFields();
    }, 1);

    this.model.klass = EquipmentItemType.FILTER;

    super.ngAfterViewInit();
  }

  private _initFields() {
    this.initBrandAndName().subscribe(() => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(),
        {
          key: "type",
          type: "ng-select",
          id: "filter-field-type",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.filterService.getPrintablePropertyName(FilterDisplayProperty.TYPE),
            required: true,
            clearable: true,
            options: Object.keys(FilterType).map(filterType => ({
              value: FilterType[filterType],
              label: this.filterService.humanizeType(FilterType[filterType])
            }))
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
                const nameField = this.fields.find(f => f.key === "name");
                this.formlyFieldService.clearMessages(nameField.templateOptions);
                this._updateGeneratedName();
                this._customNameChangesValidations(nameField, this.model.name);
              });
            }
          }
        },
        {
          key: "bandwidth",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "filter-field-bandwidth",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress,
            "templateOptions.required": () =>
              [FilterType.H_ALPHA, FilterType.H_BETA, FilterType.SII, FilterType.OIII].indexOf(this.model.type) > -1
          },
          templateOptions: {
            type: "number",
            step: 0.1,
            label: this.filterService.getPrintablePropertyName(FilterDisplayProperty.BANDWIDTH)
          },
          validators: {
            validation: [
              "number",
              {
                name: "min-value",
                options: {
                  minValue: 0
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
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
                const nameField = this.fields.find(f => f.key === "name");
                this.formlyFieldService.clearMessages(nameField.templateOptions);
                this._updateGeneratedName();
                this._customNameChangesValidations(nameField, this.model.name);
              });
            }
          }
        },
        {
          key: "size",
          type: "ng-select",
          id: "filter-field-size",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.filterService.getPrintablePropertyName(FilterDisplayProperty.SIZE),
            required: true,
            clearable: true,
            options: Object.keys(FilterSize).map(filterSize => ({
              value: FilterSize[filterSize],
              label: this.filterService.humanizeSize(FilterSize[filterSize])
            }))
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
                const nameField = this.fields.find(f => f.key === "name");
                this.formlyFieldService.clearMessages(nameField.templateOptions);
                this._updateGeneratedName();
                this._customNameChangesValidations(nameField, this.model.name);
              });
            }
          }
        },
        this._getNameField(),
        {
          key: "overrideName",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "filter-field-override-name",
          defaultValue: this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL,
          templateOptions: {
            fieldGroupClassName: "override-name",
            label: this.translateService.instant("Override generated name above"),
            description: this.translateService.instant(
              "AstroBin automatically sets the name of a filter from its properties, to keep a consistent " +
                "naming convention strategy. If your filter has a specific product name that's more recognizable, " +
                "please check this box and change its name."
            ),
            required: true,
            hideRequiredMarker: true
          }
        },
        this._getVariantOfField(EquipmentItemType.FILTER),
        this._getImageField(),
        this._getWebsiteField(),
        this._getCommunityNotesField()
      ];

      this._addBaseItemEditorFields();
    });
  }

  private _updateGeneratedName() {
    interval(10)
      .pipe(take(1))
      .subscribe(() => {
        const value = this.form.value;

        if (
          (!!value.type || !!value.bandwidth || !!value.size) &&
          !this.form.get("overrideName").value &&
          this.form.dirty
        ) {
          const typeLabel = !!value.type ? this.filterService.humanizeTypeShort(value.type) : "";
          const bandwidthLabel = !!value.bandwidth ? `${value.bandwidth}nm` : "";
          const sizeLabel =
            !!value.size && value.size !== FilterSize.OTHER ? this.filterService.humanizeSizeShort(value.size) : "";
          const generated = `${typeLabel} ${bandwidthLabel} ${sizeLabel}`.replace("  ", " ").trim();

          this.form.get("name").setValue(generated);
          this.form.get("name").markAsTouched();
          this.form.get("name").markAsDirty();
          this.form.get("name").updateValueAndValidity();
        }
      });
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    if (field.formControl.pristine) {
      return;
    }

    const filterSetWords = ["filterset", "set", "filter set", "lrgb", "l-r-g-b", "ha-oiii-sii"];

    let hasFilterSet = false;

    for (const word of filterSetWords) {
      if (value.toLowerCase().indexOf(word) > -1) {
        hasFilterSet = true;
        break;
      }
    }

    const hasBandwidth = !this.model.bandwidth || value.indexOf(`${this.model.bandwidth}nm`) > -1;
    const hasSize =
      !this.model.size ||
      this.model.size === FilterSize.OTHER ||
      value.indexOf(`${this.filterService.humanizeSizeShort(this.model.size)}`) > -1;

    if (!hasBandwidth) {
      this.formlyFieldService.addMessage(field.templateOptions, {
        level: FormlyFieldMessageLevel.INFO,
        text: this.translateService.instant(
          "Please consider making the name contain the bandwidth, to prevent ambiguity."
        )
      });
    }

    if (!hasSize) {
      this.formlyFieldService.addMessage(field.templateOptions, {
        level: FormlyFieldMessageLevel.INFO,
        text: this.translateService.instant("Please consider making the name contain the size, to prevent ambiguity.")
      });
    }

    if (hasFilterSet) {
      this.formlyFieldService.addMessage(field.templateOptions, {
        level: FormlyFieldMessageLevel.WARNING,
        text: this.translateService.instant(
          "Filter sets should be added one filter at a time, individually, so that they may be added to acquisition sessions."
        )
      });
    }
  }
}
