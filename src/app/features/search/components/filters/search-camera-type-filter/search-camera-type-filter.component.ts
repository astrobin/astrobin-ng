import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { CameraType } from "@features/equipment/types/camera.interface";
import { CameraService } from "@features/equipment/services/camera.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

@Component({
  selector: "astrobin-search-camera-type-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCameraTypeFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.CAMERA_TYPE;
  static minimumSubscription = PayableProductInterface.LITE;

  label = this.searchService.humanizeSearchAutoCompleteType(SearchCameraTypeFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchCameraTypeFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        searchable: false,
        hideOptionalMarker: true,
        label: this.label,
        description: this.translateService.instant("Only show images acquired with a specific camera type."),
        options: Object.keys(CameraType).map(cameraType => ({
          value: cameraType,
          label: this.cameraService.humanizeType(cameraType as CameraType)
        }))
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly cameraService: CameraService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(this.cameraService.humanizeType(this.value));
  }
}
