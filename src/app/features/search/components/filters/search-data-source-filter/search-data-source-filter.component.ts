import { Component } from "@angular/core";
import type { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { DataSource } from "@core/interfaces/image.interface";
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
  selector: "astrobin-search-data-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchDataSourceFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.DATA_SOURCE;
  static minimumSubscription = PayableProductInterface.ULTIMATE;

  readonly category = SearchFilterCategory.ACQUISITION_ATTRIBUTES;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchDataSourceFilterComponent.key as SearchAutoCompleteType
  );
  readonly editFields = [
    {
      key: SearchDataSourceFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        searchable: false,
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images with data from a specific source."),
        options: Object.keys(DataSource).map(dataSource => ({
          value: dataSource,
          label: this.imageService.humanizeDataSource(dataSource as DataSource)
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
    return this.domSanitizer.bypassSecurityTrustHtml(this.imageService.humanizeDataSource(this.value as DataSource));
  }
}
