import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { YesNoPipe } from "@shared/pipes/yes-no.pipe";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Component({
  selector: "astrobin-animated-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchAnimatedFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.ANIMATED;
  label = this.searchService.humanizeSearchAutoCompleteType(SearchAnimatedFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchAnimatedFilterComponent.key,
      type: "checkbox",
      wrappers: ["default-wrapper"],
      defaultValue: false,
      props: {
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show GIF animations")
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (this.value === null) {
            field.formControl.setValue(true);
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
    public readonly searchService: SearchService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(
      this.translateService.instant(new YesNoPipe().transform(this.value))
    );
  }
}
