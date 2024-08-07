import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { SearchBaseEquipmentFilterComponent } from "@features/search/components/filters/search-base-equipment-filter/search-base-equipment-filter.component";
import { Actions } from "@ngrx/effects";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-search-camera-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCameraFilterComponent extends SearchBaseEquipmentFilterComponent {
  static key = SearchAutoCompleteType.CAMERA;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly label = this.searchService.humanizeSearchAutoCompleteType(SearchCameraFilterComponent.key);
  readonly itemType: EquipmentItemType = EquipmentItemType.CAMERA;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly actions$: Actions,
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService, actions$);
    this.initFields(SearchCameraFilterComponent.key);
  }
}
