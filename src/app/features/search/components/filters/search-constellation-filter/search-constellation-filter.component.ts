import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { ConstellationsService } from "@features/explore/services/constellations.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-constellation-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchConstellationFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.CONSTELLATION;
  static minimumSubscription = PayableProductInterface.LITE;

  label = this.searchService.humanizeSearchAutoCompleteType(SearchConstellationFilterComponent.key as SearchAutoCompleteType);
  readonly constellations = this.constellationService.getConstellations(this.translateService.currentLang);
  editFields = [
    {
      key: SearchConstellationFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images in a specific constellation."),
        options: this.constellations.map(constellation => ({
          value: constellation.id,
          label: `${constellation.name} (${constellation.id})`
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
    public readonly constellationService: ConstellationsService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("");
    }

    const constellation = this.constellations.find(constellation => constellation.id === this.value);
    return this.domSanitizer.bypassSecurityTrustHtml(`${constellation.name} (${constellation.id})`);
  }
}
