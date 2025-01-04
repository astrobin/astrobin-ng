import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CountryService } from "@shared/services/country.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-country-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCountryFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.COUNTRY;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchCountryFilterComponent.key as SearchAutoCompleteType);
  readonly editFields = [
    {
      key: SearchCountryFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images acquired by users from a specific country."),
        options: this.countryService.getCountries(this.translateService.currentLang).map(country => ({
          value: country.code,
          label: country.name
        }))
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly countryService: CountryService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(
      this.countryService.getCountryName(this.value, this.translateService.currentLang)
    );
  }
}
