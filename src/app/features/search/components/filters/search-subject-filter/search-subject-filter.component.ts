import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";

@Component({
  selector: "astrobin-search-subject-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSubjectFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.SUBJECT;
  label = this.searchService.humanizeSearchAutoCompleteType(SearchSubjectFilterComponent.key);
  editFields = [
    {
      key: SearchSubjectFilterComponent.key,
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        placeholder: "M 31, NGC 1955, Sh2-142, ...",
        label: this.label,
        description: this.translateService.instant("Only show images featuring specific celestial subjects."),
        type: "text",
        hideOptionalMarker: true
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
}
