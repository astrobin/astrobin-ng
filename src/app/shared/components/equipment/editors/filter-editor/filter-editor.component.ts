import { AfterViewInit, Component, OnInit } from "@angular/core";
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
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterInterface, FilterType } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { UtilsService } from "@shared/services/utils/utils.service";

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
      this.returnToSelector = "#filter-editor-form";
    }
  }

  ngAfterViewInit(): void {
    this.utilsService.delay(1).subscribe(() => {
      this._initFields();
    });

    this.model.klass = EquipmentItemType.FILTER;

    super.ngAfterViewInit();
  }

  private _initFields() {
    this.initBrandAndName().subscribe(() => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(),
        this._getNameField(),
        this._getVariantOfField(EquipmentItemType.FILTER),
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
          }
        },
        {
          key: "bandwidth",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "filter-field-bandwidth",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
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
          }
        },
        this._getImageField(),
        this._getWebsiteField(),
        this._getCommunityNotesField()
      ];

      this._addBaseItemEditorFields();
    });
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    const filterSetWords = ["filterset", "set", "filter set", "lrgb", "l-r-g-b", "ha-oiii-sii"];
    let hasFilterSet = false;

    for (const word of filterSetWords) {
      if (value.toLowerCase().indexOf(word) > -1) {
        hasFilterSet = true;
        break;
      }
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
