import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";

export interface MarketplaceFilterModel {
  itemType?: EquipmentItemType | null;
}

@Component({
  selector: "astrobin-marketplace-filter",
  templateUrl: "./marketplace-filter.component.html",
  styleUrls: ["./marketplace-filter.component.scss"]
})
export class MarketplaceFilterComponent extends BaseComponentDirective implements OnInit {
  filterFields: FormlyFieldConfig[];
  filterForm: FormGroup = new FormGroup({});

  @Output()
  filterChange = new EventEmitter<MarketplaceFilterModel>();

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.activatedRoute.queryParams.subscribe(params => {
      this._initFilterFields(params);
    });
  }

  applyFilters() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.filterForm.value,
      queryParamsHandling: "merge"
    }).then(() => {
      this.filterChange.emit(this.filterForm.value);
    });
  }

  private _initFilterFields(params: Params) {
    this.filterFields = [
      {
        key: "itemType",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        defaultValue: params["itemType"],
        props: {
          label: this.translateService.instant("Item type"),
          options: Object.values(EquipmentItemType).map(itemType => ({
            label: this.equipmentItemService.humanizeType(itemType),
            value: itemType
          })),
          clearable: true
        }
      }
    ];
  }
}
