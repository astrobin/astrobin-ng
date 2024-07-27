import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { SearchFilterEditorModalComponent } from "@features/search/components/filters/search-filter-editor-modal/search-filter-editor-modal.component";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";
import { SearchService } from "@features/search/services/search.service";

@Component({
  selector: "astrobin-search-filter-base",
  template: ""
})
export abstract class SearchBaseFilterComponent extends BaseComponentDirective implements SearchFilterComponentInterface, OnInit {
  static key: string;
  editForm: FormGroup = new FormGroup({});
  abstract editFields: FormlyFieldConfig[];

  // Rendered label.
  @Input()
  label: string;

  // Value to be used in the search model.
  @Input()
  value: any;

  @Output()
  valueChanges = new EventEmitter<any>();

  @Output()
  remove = new EventEmitter<void>();

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.valueChanges.emit(this.value);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(this.label);
  }

  edit(): void {
    const modalRef: NgbModalRef = this.modalService.open(SearchFilterEditorModalComponent);
    const instance: SearchFilterEditorModalComponent = modalRef.componentInstance;
    const key = (this.constructor as any).key;
    instance.fields = this.editFields;
    instance.model = { [key]: this.value };
    // instance.label = this.searchService.getLabelForFilterType()
    instance.form = this.editForm;

    modalRef.closed.subscribe(keyValue => {
      this.value = keyValue[key];
      this.valueChanges.emit(this.value);
    });
  }
}
