import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseSliderFilterComponent } from "@features/search/components/filters/search-base-slider-filter/search-base-slider-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-mount-max-payload-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchMountMaxPayloadFilterComponent extends SearchBaseSliderFilterComponent {
  static key = SearchAutoCompleteType.MOUNT_MAX_PAYLOAD;
  static minimumSubscription = PayableProductInterface.ULTIMATE;

  readonly category = SearchFilterCategory.EQUIPMENT_ATTRIBUTES;
  readonly unit = "kg";
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchMountMaxPayloadFilterComponent.key as SearchAutoCompleteType
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);

    this.initFields(SearchMountMaxPayloadFilterComponent.key, { floor: 0, ceil: 200, step: 0.1 });
  }
}
