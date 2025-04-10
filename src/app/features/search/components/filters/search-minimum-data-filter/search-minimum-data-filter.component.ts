import { Component } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchMinimumDataFilterValue } from "@features/search/components/filters/search-minimum-data-filter/search-minimum-data-filter.value";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-search-minimum-data-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchMinimumDataFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.MINIMUM_DATA;
  static minimumSubscription = PayableProductInterface.ULTIMATE;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchMinimumDataFilterComponent.key as SearchAutoCompleteType
  );
  readonly values: { [key: string]: string } = {
    [SearchMinimumDataFilterValue.TELESCOPES]: this.translateService.instant("Imaging telescopes or lenses"),
    [SearchMinimumDataFilterValue.CAMERAS]: this.translateService.instant("Imaging cameras"),
    [SearchMinimumDataFilterValue.ACQUISITION_DETAILS]: this.translateService.instant("Acquisition details"),
    [SearchMinimumDataFilterValue.ASTROMETRY]: this.translateService.instant("Astrometry")
  };
  readonly editFields = [
    {
      key: SearchMinimumDataFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        searchable: false,
        closeOnSelect: true,
        hideOptionalMarker: true,
        label: this.label,
        multiple: true,
        description: this.translateService.instant("Only show images meeting a minimum data requirement."),
        options: Object.keys(this.values).map(key => ({
          value: key,
          label: this.values[key]
        }))
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (this.value === null) {
            field.formControl.setValue([
              SearchMinimumDataFilterValue.TELESCOPES,
              SearchMinimumDataFilterValue.CAMERAS,
              SearchMinimumDataFilterValue.ACQUISITION_DETAILS
            ]);
          }
        }
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    let rendered: string;

    if (!this.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("");
    }

    if (this.value.length === 1) {
      rendered = this.values[this.value[0]];
    } else {
      rendered = this.value.map(v => this.values[v]).join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(rendered);
  }
}
