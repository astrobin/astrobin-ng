import { Component } from "@angular/core";
import type { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { AcquisitionType } from "@core/interfaces/image.interface";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import type { ImageService } from "@core/services/image/image.service";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import type { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-acquisition-type-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchAcquisitionTypeFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.ACQUISITION_TYPE;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly category = SearchFilterCategory.ACQUISITION_ATTRIBUTES;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchAcquisitionTypeFilterComponent.key as SearchAutoCompleteType
  );
  readonly editFields = [
    {
      key: SearchAcquisitionTypeFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        searchable: false,
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images acquired with a certain acquisition technique."),
        options: Object.keys(AcquisitionType).map(type => ({
          value: type,
          label: this.imageService.humanizeAcquisitionType(type as AcquisitionType)
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
    if (!this.value) {
      return "";
    }

    const humanizedValue = this.imageService.humanizeAcquisitionType(this.value as AcquisitionType);
    return this.domSanitizer.bypassSecurityTrustHtml(humanizedValue);
  }
}
