import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-search-telescope-type-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchTelescopeTypeFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.TELESCOPE_TYPE;
  static minimumSubscription = PayableProductInterface.LITE;

  label = this.searchService.humanizeSearchAutoCompleteType(SearchTelescopeTypeFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchTelescopeTypeFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images acquired with a specific telescope type."),
        options: Object.keys(TelescopeType).map(telescopeType => ({
          value: telescopeType,
          label: this.telescopeService.humanizeType(telescopeType as TelescopeType)
        }))
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly telescopeService: TelescopeService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(this.telescopeService.humanizeType(this.value));
  }
}
