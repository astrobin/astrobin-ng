import { Component } from "@angular/core";
import type { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { Month } from "@core/enums/month.enum";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import type { DateService } from "@core/services/date.service";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import type { SearchFilterService } from "@features/search/services/search-filter.service";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-search-acquisition-months-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchAcquisitionMonthsFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.ACQUISITION_MONTHS;
  category = SearchFilterCategory.DATETIME;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
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
    public readonly searchFilterService: SearchFilterService,
    public readonly dateService: DateService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
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
      renderedValue = months.map(month => this.dateService.humanizeMonth(month)).join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(renderedValue);
  }
}
