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
  selector: "astrobin-search-camera-types-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCameraTypesFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.CAMERA_TYPES;
  static minimumSubscription = PayableProductInterface.LITE;

  label = this.searchService.humanizeSearchAutoCompleteType(SearchCameraTypesFilterComponent.key as SearchAutoCompleteType);
  editFields = [
    {
      key: SearchCameraTypesFilterComponent.key,
      fieldGroup: [
        {
          key: "value",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          props: {
            searchable: false,
            closeOnSelect: true,
            multiple: true,
            hideOptionalMarker: true,
            label: this.label,
            description: this.translateService.instant("Only show images acquired with certain camera types."),
            options: Object.keys(CameraType).map(cameraType => ({
              value: cameraType,
              label: this.cameraService.humanizeType(cameraType as CameraType)
            }))
          }
        },
        this.getMatchTypeField(`${SearchCameraTypesFilterComponent.key}.value`)
      ]
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
    if (!this.value) {
      return "";
    }

    const cameraTypes = this.value.value as CameraType[];
    let renderedValue;

    if (cameraTypes.length === 1) {
      renderedValue = this.cameraService.humanizeType(cameraTypes[0]);
    } else {
      renderedValue = cameraTypes
        .map(cameraType => this.cameraService.humanizeType(cameraType))
        .join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(renderedValue);
  }
}
