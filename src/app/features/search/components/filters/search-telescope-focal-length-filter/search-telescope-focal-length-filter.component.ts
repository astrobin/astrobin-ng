import { Component } from "@angular/core";
import type { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseSliderFilterComponent } from "@features/search/components/filters/search-base-slider-filter/search-base-slider-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import type { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-telescope-focal-length-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchTelescopeFocalLengthFilterComponent extends SearchBaseSliderFilterComponent {
  static key = SearchAutoCompleteType.TELESCOPE_FOCAL_LENGTH;
  static minimumSubscription = PayableProductInterface.ULTIMATE;
  category = SearchFilterCategory.EQUIPMENT_ATTRIBUTES;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchTelescopeFocalLengthFilterComponent.key as SearchAutoCompleteType
  );
  unit = "mm";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);

    this.initFields(SearchTelescopeFocalLengthFilterComponent.key, { floor: 0, ceil: 10000, step: 1 });
  }
}
