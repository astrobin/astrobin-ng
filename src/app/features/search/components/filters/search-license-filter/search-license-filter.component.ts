import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { LicenseOptions } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";

@Component({
  selector: "astrobin-license-data-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchLicenseFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.LICENSES;
  readonly label = this.searchService.humanizeSearchAutoCompleteType(SearchLicenseFilterComponent.key as SearchAutoCompleteType);
  readonly editFields = [
    {
      key: SearchLicenseFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
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
    public readonly searchService: SearchService,
    public readonly imageService: ImageService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
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
