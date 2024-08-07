import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { DataSource } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-search-data-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchDataSourceFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.DATA_SOURCE;
  static minimumSubscription = PayableProductInterface.ULTIMATE;

  label = this.searchService.humanizeSearchAutoCompleteType(
    SearchDataSourceFilterComponent.key as SearchAutoCompleteType
  );
  editFields = [
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
    public readonly searchService: SearchService,
    public readonly imageService: ImageService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(this.imageService.humanizeDataSource(this.value as DataSource));
  }
}
