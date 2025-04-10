import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { RemoteSource } from "@core/interfaces/image.interface";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-search-remote-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchRemoteSourceFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.REMOTE_SOURCE;
  static minimumSubscription = PayableProductInterface.ULTIMATE;
  category = SearchFilterCategory.ACQUISITION_ATTRIBUTES;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
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
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(RemoteSource[this.value]);
  }
}
