import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { SearchBaseEquipmentFilterComponent } from "@features/search/components/filters/search-base-equipment-filter/search-base-equipment-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-search-sensor-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSensorFilterComponent extends SearchBaseEquipmentFilterComponent {
  static key = SearchAutoCompleteType.SENSOR;
  static minimumSubscription = PayableProductInterface.LITE;
  category = SearchFilterCategory.EQUIPMENT;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchSensorFilterComponent.key);
  readonly itemType: EquipmentItemType = EquipmentItemType.SENSOR;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly actions$: Actions
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService, actions$);
    this.initFields(SearchSensorFilterComponent.key);
  }
}
