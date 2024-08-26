import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { Month } from "@shared/enums/month.enum";
import { DateService } from "@shared/services/date.service";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";

@Component({
  selector: "astrobin-search-acquisition-months-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchAcquisitionMonthsFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.ACQUISITION_MONTHS;
  category = SearchFilterCategory.DATETIME;
  label = this.searchService.humanizeSearchAutoCompleteType(
    SearchAcquisitionMonthsFilterComponent.key as SearchAutoCompleteType
  );
  editFields = [
    {
      key: SearchAcquisitionMonthsFilterComponent.key,
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
            searchable: false,
            closeOnSelect: true,
            hideOptionalMarker: true,
            multiple: true,
            label: this.label,
            description: this.translateService.instant("Only show images acquired in specific months of any year."),
            options: Object.keys(Month).map(month => ({
              value: month,
              label: this.dateService.humanizeMonth(month as Month)
            }))
          }
        },
        this.getMatchTypeField(`${SearchAcquisitionMonthsFilterComponent.key}.value`)
      ]
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly dateService: DateService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const months = this.value.value as Month[];
    let renderedValue;

    if (months.length === 1) {
      renderedValue = this.dateService.humanizeMonth(months[0]);
    } else {
      renderedValue = months
        .map(month => this.dateService.humanizeMonth(month))
        .join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(renderedValue);
  }
}
