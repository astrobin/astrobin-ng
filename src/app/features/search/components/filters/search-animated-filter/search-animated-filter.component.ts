import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { YesNoPipe } from "@shared/pipes/yes-no.pipe";

@Component({
  selector: "astrobin-animated-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchAnimatedFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.ANIMATED;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly category = SearchFilterCategory.FILE_ATTRIBUTES;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchAnimatedFilterComponent.key as SearchAutoCompleteType
  );
  readonly editFields = [
    {
      key: SearchAnimatedFilterComponent.key,
      type: "checkbox",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label
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
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(
      this.translateService.instant(new YesNoPipe().transform(this.value))
    );
  }

  hasValue(value?: any): boolean {
    if (value === null || value === undefined) {
      value = this.value;
    }

    return value;
  }
}
