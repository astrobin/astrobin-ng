import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-search-telescope-types-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchTelescopeTypesFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.TELESCOPE_TYPES;
  static minimumSubscription = PayableProductInterface.LITE;

  label = this.searchService.humanizeSearchAutoCompleteType(SearchTelescopeTypesFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchTelescopeTypesFilterComponent.key,
      fieldGroup: [
        {
          key: "value",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          expressions: {
            className: () => {
              return this.value?.value?.length <= 1 ? "mb-0" : "";
            }
          },
          props: {
            closeOnSelect: true,
            hideOptionalMarker: true,
            multiple: true,
            label: this.label,
            description: this.translateService.instant("Only show images acquired with certain telescope types."),
            options: Object.keys(TelescopeType).map(telescopeType => ({
              value: telescopeType,
              label: this.telescopeService.humanizeType(telescopeType as TelescopeType)
            }))
          }
        },
        this.getMatchTypeField(`${SearchTelescopeTypesFilterComponent.key}.value`)
      ]
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly telescopeService: TelescopeService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const telescopeTypes = this.value.value as TelescopeType[];
    let renderedValue;

    if (telescopeTypes.length === 1) {
      renderedValue = this.telescopeService.humanizeType(telescopeTypes[0]);
    } else {
      renderedValue = telescopeTypes
        .map(telescopeType => this.telescopeService.humanizeType(telescopeType))
        .join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(renderedValue);
  }
}
