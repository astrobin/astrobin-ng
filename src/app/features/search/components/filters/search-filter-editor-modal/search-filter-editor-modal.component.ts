import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { SearchService } from "@features/search/services/search.service";

@Component({
  selector: "astrobin-search-filter-editor-modal",
  templateUrl: "./search-filter-editor-modal.component.html",
  styleUrls: ["./search-filter-editor-modal.component.scss"]
})
export class SearchFilterEditorModalComponent extends BaseComponentDirective {
  @Input()
  form: FormGroup;

  @Input()
  model: any;

  @Input()
  fields: FormlyFieldConfig[];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly searchService: SearchService
  ) {
    super(store$);
  }
}
