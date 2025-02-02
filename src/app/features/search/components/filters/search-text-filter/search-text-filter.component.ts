import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-text-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchTextFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.TEXT;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchTextFilterComponent.key);
  readonly mayBeRemoved = false;
  readonly infoText = this.translateService.instant(
    "This searches the title, description, and most image attributes, even if the exact words don't match perfectly." +
    " You can use quotation marks for exact matching, and the minus sign to exclude keywords. To do even more" +
    " precise searches, add filters."
  );
  readonly editFields = [
    {
      key: SearchTextFilterComponent.key,
      fieldGroup: [
        {
          key: "value",
          type: "input",
          wrappers: ["default-wrapper"],
          props: {
            placeholder: this.translateService.instant("Search"),
            label: this.label,
            description: this.infoText,
            type: "text",
            hideOptionalMarker: true
          }
        },
        this.getMatchTypeField(`${SearchTextFilterComponent.key}.value`, " "),
        {
          key: "onlySearchInTitlesAndDescriptions",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          defaultValue: false,
          props: {
            hideOptionalMarker: true,
            label: this.translateService.instant("Only search in titles and descriptions")
          }
        }
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
    return this.domSanitizer.bypassSecurityTrustHtml(this.value?.value || "");
  }
}
