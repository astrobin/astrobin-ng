import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { CameraService } from "@features/equipment/services/camera.service";

@Component({
  selector: "astrobin-search-award-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchAwardFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.AWARD;
  readonly label = this.searchService.humanizeSearchAutoCompleteType(SearchAwardFilterComponent.key as SearchAutoCompleteType);
  readonly values: { [key: string]: string } = {
    iotd: this.translateService.instant("Image of the day"),
    "top-pick": this.translateService.instant("Top Pick"),
    "top-pick-nomination": this.translateService.instant("Top Pick Nomination")
  };
  readonly editFields = [
    {
      key: SearchAwardFilterComponent.key,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        hideOptionalMarker: true,
        label: this.label,
        multiple: true,
        description: this.translateService.instant("Only show images that won any of the selected IOTD/TP awards"),
        options: Object.keys(this.values).map(key => ({
          value: key,
          label: this.values[key]
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
    let rendered: string;

    if (!this.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("");
    }

    if (this.value.length === 1) {
      rendered = this.values[this.value[0]];
    } else {
      rendered = this.value.map(v => this.values[v]).join(", ");
    }

    return this.domSanitizer.bypassSecurityTrustHtml(rendered);
  }
}
