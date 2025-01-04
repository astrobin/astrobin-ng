import { Component } from "@angular/core";
import { SearchService } from "@features/search/services/search.service";
import { SearchBaseSliderFilterComponent } from "@features/search/components/filters/search-base-slider-filter/search-base-slider-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-telescope-weight-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchTelescopeWeightFilterComponent extends SearchBaseSliderFilterComponent {
  static key = SearchAutoCompleteType.TELESCOPE_WEIGHT;
  static minimumSubscription = PayableProductInterface.ULTIMATE;
  category = SearchFilterCategory.EQUIPMENT_ATTRIBUTES;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchTelescopeWeightFilterComponent.key as SearchAutoCompleteType
  );
  unit = "kg";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);

    this.initFields(SearchTelescopeWeightFilterComponent.key, { floor: 0, ceil: 200, step: .1 });
  }
}
