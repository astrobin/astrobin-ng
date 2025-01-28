import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UtilsService } from "@core/services/utils/utils.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-subjects-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSubjectsFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.SUBJECTS;

  readonly category = SearchFilterCategory.SKY_AND_SUBJECTS;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchSubjectsFilterComponent.key);
  readonly editFields = [
    {
      key: SearchSubjectsFilterComponent.key,
      fieldGroup: [
        {
          key: "value",
          type: "input",
          className: "d-none",
          parsers: [],
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              // Sync the initial array value to the text input
              const initialArray = field.formControl.value || [];
              field.parent?.formControl?.get("textValue")?.setValue(initialArray.map(item => item.trim()).join(", "));
            }
          }
        },
        {
          key: "textValue",
          type: "input",
          wrappers: ["default-wrapper"],
          props: {
            placeholder: "M 31, NGC 1955, Sh2-142, ...",
            label: this.label,
            description: this.translateService.instant(
              "Only show images featuring specific celestial subjects. Use a comma to separate multiple subjects."
            ),
            type: "text",
            hideOptionalMarker: true
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.subscribe(value => {
                const arrayValue = UtilsService.isString(value)
                  ? value.split(",").filter(tag => !!tag)
                  : [];
                field.parent?.formControl?.get("value")?.setValue(arrayValue);
              });
            }
          }
        },
        this.getMatchTypeField(`${SearchSubjectsFilterComponent.key}.value`)
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
    const arrayValue = this.value?.value;
    if (!arrayValue) {
      return "";
    }

    return this.domSanitizer.bypassSecurityTrustHtml(arrayValue.join(", "));
  }
}
