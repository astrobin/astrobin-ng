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
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { MatchType } from "@features/search/enums/match-type.enum";
import { takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isObservable, Subscription } from "rxjs";

@Component({
  selector: "astrobin-search-filter-base",
  template: ""
})
export abstract class SearchBaseFilterComponent extends BaseComponentDirective implements SearchFilterComponentInterface, OnInit {
  // This is the attribute that ends up in the search query.
  static key: SearchAutoCompleteType;

  editForm: FormGroup = new FormGroup({});
  editModel: any = {};
  valueTransformer: (value: any) => any = value => value;

  abstract editFields: FormlyFieldConfig[];
  abstract label: string;

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
    return this.domSanitizer.bypassSecurityTrustHtml(this.value);
  }

  edit(): void {
    const modalRef: NgbModalRef = this.modalService.open(SearchFilterEditorModalComponent);
    const instance: SearchFilterEditorModalComponent = modalRef.componentInstance;
    const key = this.searchService.getKeyByFilterComponentInstance(this);
    instance.fields = [...this.editFields];
    instance.model = { [key]: UtilsService.cloneValue(this.value) };
    this.editModel = { ...instance.model };
    instance.form = this.editForm;

    const applyValue = (value: any) => {
      this.value = value;
      this.valueChanges.emit(this.value);
    }

    modalRef.closed.subscribe(keyValue => {
      const transformedValue = this.valueTransformer(keyValue[key]);
      if (isObservable(transformedValue)) {
        transformedValue.subscribe(value => {
          applyValue(value);
        });
      } else {
        applyValue(transformedValue);
      }
    });
  }

  hasValue(value?: any): boolean {
    if (!value) {
      value = this.value;
    }

    if (!value) {
      return false;
    }

    if (UtilsService.isArray(value)) {
      return value.length > 0;
    }

    if (UtilsService.isObject(value)) {
      if (value.hasOwnProperty("value")) {
        return this.hasValue(value.value);
      }
    }

    return true;
  }

  getMatchTypeField(listKey: string): FormlyFieldConfig {
    return {
      key: `matchType`,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      expressions: {
        className: () => {
          const value = this.editForm.get(listKey).value;
          return !value || value.length <= 1 ? "d-none" : "";
        }
      },
      props: {
        searchable: false,
        label: this.translateService.instant("Match type"),
        hideOptionalMarker: true,
        options: [
          {
            value: MatchType.ALL,
            label: this.searchService.humanizeMatchType(MatchType.ALL)
          },
          {
            value: MatchType.ANY,
            label: this.searchService.humanizeMatchType(MatchType.ANY)
          }
        ]
      },
      hooks: {
        onInit: field => {
          this.editForm.get(listKey).valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
            if (!value || value.length <= 1) {
              field.formControl.setValue(null);
            } else if (field.formControl.value === null) {
              field.formControl.setValue(MatchType.ANY);
            }
          });
        }
      }
    };
  }
}
