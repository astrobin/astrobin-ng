import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraType } from "@features/equipment/types/camera.interface";
import { CameraService } from "@features/equipment/services/camera.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-camera-types-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCameraTypesFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.CAMERA_TYPES;
  static minimumSubscription = PayableProductInterface.LITE;

  readonly category = SearchFilterCategory.EQUIPMENT_ATTRIBUTES;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchCameraTypesFilterComponent.key as SearchAutoCompleteType);
  readonly editFields = [
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
    public readonly searchFilterService: SearchFilterService,
    public readonly cameraService: CameraService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
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
