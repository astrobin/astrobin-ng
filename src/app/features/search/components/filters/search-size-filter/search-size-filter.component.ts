import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseSliderFilterComponent } from "@features/search/components/filters/search-base-slider-filter/search-base-slider-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-size-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSizeFilterComponent extends SearchBaseSliderFilterComponent {
  static key = SearchAutoCompleteType.SIZE;
  category = SearchFilterCategory.FILE_ATTRIBUTES;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchSizeFilterComponent.key as SearchAutoCompleteType
  );
  unit = "MB";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);

    this.initFields(SearchSizeFilterComponent.key, { floor: 0, ceil: 1000, step: 0.1 });
  }
}
