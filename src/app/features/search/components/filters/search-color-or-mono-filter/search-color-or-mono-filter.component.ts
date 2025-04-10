import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SensorService } from "@features/equipment/services/sensor.service";
import { ColorOrMono } from "@features/equipment/types/sensor.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-search-color-or-mono-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchColorOrMonoFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.COLOR_OR_MONO;

  readonly category = SearchFilterCategory.EQUIPMENT_ATTRIBUTES;
  readonly;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchColorOrMonoFilterComponent.key as SearchAutoCompleteType
  );
  readonly editFields = [
    {
      key: SearchColorOrMonoFilterComponent.key,
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
            description: this.translateService.instant("Only show images acquired with color or monochrome sensors."),
            options: Object.keys(ColorOrMono).map(value => ({
              value: value,
              label: this.sensorService.humanizeColorOrMono(value as ColorOrMono)
            }))
          }
        },
        this.getMatchTypeField(`${SearchColorOrMonoFilterComponent.key}.value`)
      ]
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly sensorService: SensorService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const value = this.value.value as ColorOrMono[];
    let renderedValue;

    if (value.length === 1) {
      renderedValue = this.sensorService.humanizeColorOrMono(value[0]);
    } else {
      renderedValue = value.map(x => this.sensorService.humanizeColorOrMono(x)).join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(renderedValue);
  }
}
