import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { SolarSystemSubjectType, SubjectType } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";

@Component({
  selector: "astrobin-subject-type-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSubjectTypeFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.SUBJECT_TYPE;
  label = this.searchService.humanizeSearchAutoCompleteType(SearchSubjectTypeFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchSubjectTypeFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        options: Object.keys(SubjectType).map(subjectType => ({
          value: subjectType,
          label: this.imageService.humanizeSubjectType(subjectType as SubjectType)
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
    let humanizedValue: string;

    if (Object.values(SubjectType).includes(this.value as SubjectType)) {
      humanizedValue = this.imageService.humanizeSubjectType(this.value as SubjectType);
    } else if (Object.values(SolarSystemSubjectType).includes(this.value as SolarSystemSubjectType)) {
      humanizedValue = this.imageService.humanizeSolarSystemSubjectType(this.value as SolarSystemSubjectType);
    } else {
      humanizedValue = "";
    }

    return this.domSanitizer.bypassSecurityTrustHtml(humanizedValue);
  }
}
