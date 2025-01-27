import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SolarSystemSubjectType, SubjectType } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-subject-type-source-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSubjectTypeFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.SUBJECT_TYPE;
  static minimumSubscription = PayableProductInterface.LITE;
  category = SearchFilterCategory.SKY_AND_SUBJECTS;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchSubjectTypeFilterComponent.key as SearchAutoCompleteType
  );
  editFields = [
    {
      key: SearchSubjectTypeFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        searchable: false,
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images of a specific subject type."),
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
    public readonly searchFilterService: SearchFilterService,
    public readonly imageService: ImageService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
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
