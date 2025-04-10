import { Component } from "@angular/core";
import type { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchPersonalFiltersFilterValue } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.value";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import type { SearchFilterService } from "@features/search/services/search-filter.service";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-personal-filters-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchPersonalFiltersFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.PERSONAL_FILTERS;
  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchPersonalFiltersFilterComponent.key as SearchAutoCompleteType
  );
  readonly values: { [key: string]: string } = {
    [SearchPersonalFiltersFilterValue.MY_IMAGES]: this.searchFilterService.humanizePersonalFilter(
      SearchPersonalFiltersFilterValue.MY_IMAGES
    ),
    [SearchPersonalFiltersFilterValue.MY_LIKES]: this.searchFilterService.humanizePersonalFilter(
      SearchPersonalFiltersFilterValue.MY_LIKES
    ),
    [SearchPersonalFiltersFilterValue.MY_BOOKMARKS]: this.searchFilterService.humanizePersonalFilter(
      SearchPersonalFiltersFilterValue.MY_BOOKMARKS
    ),
    [SearchPersonalFiltersFilterValue.MY_FOLLOWED_USERS]: this.searchFilterService.humanizePersonalFilter(
      SearchPersonalFiltersFilterValue.MY_FOLLOWED_USERS
    )
  };
  readonly editFields = [
    {
      key: SearchPersonalFiltersFilterComponent.key,
      fieldGroup: [
        {
          key: "value",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          props: {
            searchable: false,
            closeOnSelect: true,
            hideOptionalMarker: true,
            label: this.label,
            multiple: true,
            options: Object.keys(this.values).map(key => ({
              value: key,
              label: this.values[key]
            }))
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              if (this.value === null) {
                field.formControl.setValue([]);
              }
            }
          }
        },
        this.getMatchTypeField(`${SearchPersonalFiltersFilterComponent.key}.value`)
      ]
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

    if (this.value.value.length === 1) {
      rendered = this.values[this.value.value[0]];
    } else {
      rendered = this.value.value.map(v => this.values[v]).join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(rendered);
  }
}
