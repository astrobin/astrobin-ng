import { Component } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { LicenseOptions } from "@core/interfaces/image.interface";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { ImageService } from "@core/services/image/image.service";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-license-data-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchLicenseFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.LICENSES;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchLicenseFilterComponent.key as SearchAutoCompleteType
  );
  readonly editFields = [
    {
      key: SearchLicenseFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        searchable: false,
        closeOnSelect: true,
        hideOptionalMarker: true,
        label: this.label,
        multiple: true,
        description: this.translateService.instant("Only show images with the any of the selected licenses."),
        options: Object.keys(LicenseOptions).map(key => ({
          value: key,
          label: this.imageService.humanizeLicenseOption(key as LicenseOptions)
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
    public readonly imageService: ImageService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    let rendered: string;

    if (!this.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("");
    }

    if (this.value.length === 1) {
      rendered = this.imageService.humanizeLicenseOption(this.value[0]);
    } else {
      rendered = this.value.map(value => this.imageService.humanizeLicenseOption(value)).join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(rendered);
  }
}
