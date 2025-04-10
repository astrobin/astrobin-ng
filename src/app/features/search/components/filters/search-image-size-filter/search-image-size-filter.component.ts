import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-image-size-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchImageSizeFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.IMAGE_SIZE;
  readonly category = SearchFilterCategory.FILE_ATTRIBUTES;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchImageSizeFilterComponent.key as SearchAutoCompleteType
  );
  readonly widthLabel = this.translateService.instant("Width");
  readonly heightLabel = this.translateService.instant("Height");
  readonly unit = "px";

  editFields = [
    {
      key: SearchImageSizeFilterComponent.key,
      fieldGroup: [
        {
          key: "w",
          type: "slider",
          wrappers: ["default-wrapper"],
          props: {
            label: this.widthLabel,
            required: true,
            sliderOptions: {
              floor: 1,
              ceil: 16536
            }
          }
        },
        {
          key: "h",
          type: "slider",
          wrappers: ["default-wrapper"],
          props: {
            label: this.heightLabel,
            required: true,
            sliderOptions: {
              floor: 1,
              ceil: 16536
            }
          }
        }
      ],
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!this.editModel[SearchImageSizeFilterComponent.key]) {
            field.formControl.setValue({
              w: { min: 1, max: 16536 },
              h: { min: 1, max: 16536 }
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
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const minW = this.value.w.min;
    const maxW = this.value.w.max;
    const minH = this.value.h.min;
    const maxH = this.value.h.max;

    return this.domSanitizer.bypassSecurityTrustHtml(`${minW} - ${maxW} ${this.unit} x ${minH} - ${maxH} ${this.unit}`);
  }
}
