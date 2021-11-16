import { AfterViewInit, Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseItemEditorComponent } from "@features/equipment/components/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterInterface, FilterType } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

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
    public readonly filterService: FilterService
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
    this.fields = [
      this._getBrandField(),
      this._getNameField(),
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
          step: 1,
          label: this.filterService.getPrintablePropertyName(FilterDisplayProperty.BANDWIDTH)
        },
        validators: {
          validation: [
            "number",
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
        key: "size",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "filter-field-size",
        expressionProperties: {
          "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          step: 0.1,
          label: this.filterService.getPrintablePropertyName(FilterDisplayProperty.SIZE)
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
                maxValue: 99.99
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
      this._getImageField()
    ];

    this._addBaseItemEditorFields();
  }
}
