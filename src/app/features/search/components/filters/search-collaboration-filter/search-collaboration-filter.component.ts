import { Component } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { YesNoPipe } from "@shared/pipes/yes-no.pipe";

@Component({
  selector: "astrobin-collaboration-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCollaborationFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.COLLABORATION;
  static minimumSubscription = PayableProductInterface.LITE;
  category = SearchFilterCategory.ACQUISITION_ATTRIBUTES;
  label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchCollaborationFilterComponent.key as SearchAutoCompleteType
  );
  editFields = [
    {
      key: SearchCollaborationFilterComponent.key,
      type: "checkbox",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Include/exclude images created by multiple photographers.")
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
}
