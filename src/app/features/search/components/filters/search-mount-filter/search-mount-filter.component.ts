import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { SearchBaseEquipmentFilterComponent } from "@features/search/components/filters/search-base-equipment-filter/search-base-equipment-filter.component";
import { Actions } from "@ngrx/effects";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-mount-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchMountFilterComponent extends SearchBaseEquipmentFilterComponent {
  static key = SearchAutoCompleteType.MOUNT;
  static minimumSubscription = PayableProductInterface.LITE;
  category = SearchFilterCategory.EQUIPMENT;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchMountFilterComponent.key);
  readonly itemType: EquipmentItemType = EquipmentItemType.MOUNT;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly actions$: Actions
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService, actions$);
    this.initFields(SearchMountFilterComponent.key, true);
  }
}
