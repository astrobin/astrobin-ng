import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
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
import { FormlyFieldMessage, FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterInterface, FilterSize, FilterType } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { switchMap, take, takeUntil } from "rxjs/operators";
import { interval } from "rxjs";
import { isGroupMember } from "@shared/operators/is-group-member.operator";
import { Constants } from "@shared/constants";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "astrobin-filter-editor",
  templateUrl: "./filter-editor.component.html",
  styleUrls: ["./filter-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class FilterEditorComponent extends BaseItemEditorComponent<FilterInterface, null> implements OnInit {
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
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object
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
      this.returnToSelector = "#filter-editor-form";
    }

    this.model.klass = EquipmentItemType.FILTER;
    this._initFields();
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    if (field.formControl.pristine) {
      return;
    }

    const filterSetWords = ["filterset", "set", "filter set", "lrgb", "l-r-g-b", "ha-oiii-sii", "rgb", "r-g-b"];

    let hasFilterSet = false;

    for (const word of filterSetWords) {
      if (value.toLowerCase().indexOf(word) > -1) {
        hasFilterSet = true;
        break;
      }
    }

    const hasBandwidth =
      !this.model.bandwidth ||
      value.indexOf(`${this.model.bandwidth}nm`) > -1 ||
      value.indexOf(`${this.model.bandwidth} nm`) > -1;

    const hasSize =
      !this.model.size ||
      this.model.size === FilterSize.OTHER ||
      value.indexOf(`${this.filterService.humanizeSizeShort(this.model.size)}`) > -1;

    const bandWidthMessage: FormlyFieldMessage = {
      level: FormlyFieldMessageLevel.INFO,
      text: this.translateService.instant(
        "Please consider making the name contain the bandwidth, to prevent ambiguity."
      )
    };

    const sizeMessage: FormlyFieldMessage = {
      level: FormlyFieldMessageLevel.INFO,
      text: this.translateService.instant("Please consider making the name contain the size, to prevent ambiguity.")
    };

    if (!hasBandwidth) {
      this.formlyFieldService.addMessage(field, bandWidthMessage);
    } else {
      this.formlyFieldService.removeMessage(field, bandWidthMessage);
    }

    if (!hasSize) {
      this.formlyFieldService.addMessage(field, sizeMessage);
    } else {
      this.formlyFieldService.removeMessage(field, sizeMessage);
    }

    if (hasFilterSet) {
      this.form.get("name").setErrors({ "filter-name-is-set": true });
    } else {
      this.form.get("name").setErrors(null);
    }
  }

  private _initFields() {
    this.initBrandAndName()
      .pipe(switchMap(() => this.currentUser$.pipe(take(1), isGroupMember(Constants.EQUIPMENT_MODERATORS_GROUP))))
      .subscribe(isModerator => {
        if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision || isModerator) {
          this.fields = [
            this._getDIYField(),
            this._getBrandField(),
            this._getTypeField(),
            this._getBandwidthField(),
            this._getSizeField()
          ];
        } else {
          this.fields = [];

          if (this.model.type === null || this.model.type === FilterType.OTHER) {
            this.fields.push(this._getTypeField());
          }

          if (!this.model.bandwidth) {
            this.fields.push(this._getBandwidthField());
          }

          if (this.model.size === null || this.model.size === FilterSize.OTHER) {
            this.fields.push(this._getSizeField());
          }
        }

        this.fields = [
          ...this.fields,
          this._getNameField(),
          this._getOverrideNameField(),
          this._getVariantOfField(EquipmentItemType.FILTER, isModerator),
          this._getImageField(),
          this._getWebsiteField(),
          this._getCommunityNotesField()
        ];

        this._addBaseItemEditorFields();
      });
  }

  private _updateGeneratedName() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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

  private _getTypeField() {
    return {
      key: "type",
      type: "ng-select",
      id: "filter-field-type",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
            this.formlyFieldService.clearMessages(nameField);
            this._updateGeneratedName();
            this._customNameChangesValidations(nameField, this.model.name);
          });
        }
      }
    };
  }

  private _getBandwidthField() {
    return {
      key: "bandwidth",
      type: "custom-number",
      wrappers: ["default-wrapper"],
      id: "filter-field-bandwidth",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress",
        "props.required": "['H_ALPHA', 'H_BETA', 'SII', 'OIII'].indexOf(model.type) > -1"
      },
      props: {
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
            this.formlyFieldService.clearMessages(nameField);
            this._updateGeneratedName();
            this._customNameChangesValidations(nameField, this.model.name);
          });
        }
      }
    };
  }

  private _getSizeField() {
    return {
      key: "size",
      type: "ng-select",
      id: "filter-field-size",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
            this.formlyFieldService.clearMessages(nameField);
            this._updateGeneratedName();
            this._customNameChangesValidations(nameField, this.model.name);
          });
        }
      }
    };
  }

  private _getOverrideNameField() {
    return {
      key: "overrideName",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "filter-field-override-name",
      defaultValue: this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL,
      props: {
        fieldGroupClassName: "override-name",
        label: this.translateService.instant("Override generated name above"),
        description: this.translateService.instant(
          "AstroBin automatically sets the name of a filter from its properties, to keep a consistent " +
          "naming convention strategy. If your filter has a specific product name that's more recognizable, " +
          "please check this box and change its name."
        ),
        required: true,
        hideRequiredMarker: true
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this._updateGeneratedName();
          });
        }
      }
    };
  }
}
