import { Component } from "@angular/core";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { SearchBaseSliderFilterComponent } from "@features/search/components/filters/search-base-slider-filter/search-base-slider-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-pixel-scale-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchPixelScaleFilterComponent extends SearchBaseSliderFilterComponent {
  static key = SearchAutoCompleteType.PIXEL_SCALE;
  static minimumSubscription = PayableProductInterface.ULTIMATE;

  unit = "\"/px";
  label = this.searchService.humanizeSearchAutoCompleteType(
    SearchPixelScaleFilterComponent.key as SearchAutoCompleteType
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);

    this.initFields(SearchPixelScaleFilterComponent.key, { floor: 0, ceil: 10, step: .1 });
  }
}
