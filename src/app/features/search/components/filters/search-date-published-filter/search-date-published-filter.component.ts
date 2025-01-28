import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchBaseDateRangeFilterComponent } from "@features/search/components/filters/search-base-date-range-filter/search-base-date-range-filter.component";
import { DateService } from "@core/services/date.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-date-published-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchDatePublishedFilterComponent extends SearchBaseDateRangeFilterComponent {
  static key = SearchAutoCompleteType.DATE_PUBLISHED;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly category = SearchFilterCategory.DATETIME;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchDatePublishedFilterComponent.key as SearchAutoCompleteType
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly utilsService: UtilsService,
    public readonly dateService: DateService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService, utilsService, dateService);

    this.initFields(SearchDatePublishedFilterComponent.key);
  }
}
