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
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-video-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchVideoFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.VIDEO;
  static minimumSubscription = PayableProductInterface.LITE;

  label = this.searchService.humanizeSearchAutoCompleteType(SearchVideoFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchVideoFilterComponent.key,
      type: "checkbox",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
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
