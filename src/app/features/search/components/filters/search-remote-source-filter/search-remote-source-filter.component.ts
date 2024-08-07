import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { RemoteSource } from "@shared/interfaces/image.interface";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-search-remote-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchRemoteSourceFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.REMOTE_SOURCE;
  static minimumSubscription = PayableProductInterface.ULTIMATE;

  label = this.searchService.humanizeSearchAutoCompleteType(
    SearchRemoteSourceFilterComponent.key as SearchAutoCompleteType
  );
  editFields = [
    {
      key: SearchRemoteSourceFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images acquired at a specific remote hosting facility."),
        options: Object.entries(RemoteSource).map(remoteSource => ({
          value: remoteSource[0],
          label: remoteSource[1]
        }))
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(RemoteSource[this.value]);
  }
}
