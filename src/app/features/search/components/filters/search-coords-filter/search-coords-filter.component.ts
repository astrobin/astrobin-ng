import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AstroUtilsService } from "@shared/services/astro-utils/astro-utils.service";

@Component({
  selector: "astrobin-coords-size-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCoordsFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.COORDS;
  readonly label = this.searchService.humanizeSearchAutoCompleteType(
    SearchCoordsFilterComponent.key as SearchAutoCompleteType
  );
  readonly raLabel = this.translateService.instant("Right ascension");
  readonly decLabel = this.translateService.instant("Declination");

  editFields = [
    {
      key: SearchCoordsFilterComponent.key,
      fieldGroup: [
        {
          key: "ra",
          type: "slider",
          wrappers: ["default-wrapper"],
          props: {
            label: this.raLabel,
            required: true,
            showInputs: false,
            sliderOptions: {
              floor: 0,
              ceil: 1440,  // 24 hours * 60 minutes
              step: 1,
              translate: (value: number): string => this.astroUtilsService.formatRa(value)
            }
          }
        },
        {
          key: "dec",
          type: "slider",
          wrappers: ["default-wrapper"],
          props: {
            label: this.decLabel,
            required: true,
            showInputs: false,
            sliderOptions: {
              floor: -90,
              ceil: 90,
              step: .1,
              translate: (value: number): string => this.astroUtilsService.formatDec(value)
            }
          }
        }
      ],
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!this.editModel[SearchCoordsFilterComponent.key]) {
            field.formControl.setValue({
              ra: { min: 0, max: 1440 },
              dec: { min: -90, max: 90 }
            });
          }
        }
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly astroUtilsService: AstroUtilsService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const minRa = this.astroUtilsService.formatRa(this.value.ra.min);
    const maxRa = this.astroUtilsService.formatRa(this.value.ra.max);
    const minDec = this.value.dec.min;
    const maxDec = this.value.dec.max

    return this.domSanitizer.bypassSecurityTrustHtml(`RA: ${minRa} - ${maxRa}, Dec: ${minDec} - ${maxDec}`);
  }
}
