import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-search-subject-filter",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchSubjectFilterComponent extends SearchBaseFilterComponent {
  static keys = ["subject"];

  title = this.translateService.instant("Subject");
  editFields = [
    {
      key: SearchSubjectFilterComponent.keys[0],
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        label: this.title,
        type: "text"
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal
  ) {
    super(store$, translateService, domSanitizer, modalService);
  }

  render(): SafeHtml {
    return this.value?.subject;
  }
}
