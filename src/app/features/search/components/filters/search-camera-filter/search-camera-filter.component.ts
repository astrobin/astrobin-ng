import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-search-telescope-filter",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchCameraFilterComponent extends SearchBaseFilterComponent {
  static key = "camera";

  title = this.translateService.instant("Camera");
  editFields = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal
  ) {
    super(store$, translateService, domSanitizer, modalService);
  }

  render(): SafeHtml {
    return this.value?.name;
  }
}
