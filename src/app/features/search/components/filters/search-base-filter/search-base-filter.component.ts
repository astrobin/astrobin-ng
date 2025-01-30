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
import { SearchFilterCategory, SearchFilterComponentInterface } from "@core/interfaces/search-filter-component.interface";
import { MatchType } from "@features/search/enums/match-type.enum";
import { takeUntil } from "rxjs/operators";
import { UtilsService } from "@core/services/utils/utils.service";
import { isObservable } from "rxjs";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-filter-base",
  template: ""
})
export abstract class SearchBaseFilterComponent
  extends BaseComponentDirective
  implements SearchFilterComponentInterface, OnInit {
  // This is the attribute that ends up in the search query.
  static key: SearchAutoCompleteType;
  static minimumSubscription: PayableProductInterface = null;

  editForm: FormGroup = new FormGroup({});
  editModel: any = {};
  mayBeRemoved = true;
  infoText: string = null;
  abstract editFields: FormlyFieldConfig[];
  abstract label: string;
  abstract category: SearchFilterCategory;
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
    public readonly searchFilterService: SearchFilterService
  ) {
    super(store$);
  }

  readonly valueTransformer: (value: any) => any = value => value;

  ngOnInit(): void {
    this.valueChanges.emit(this.value);
  }

  render(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(this.value);
  }

  edit(): void {
    const minimumSubscription = (this.constructor as any).minimumSubscription;
    this.searchFilterService.allowFilter$(minimumSubscription).subscribe(allowEdit => {
      if (allowEdit) {
        this._openEditModal();
      } else {
        this.searchFilterService.openSubscriptionRequiredModal(minimumSubscription);
      }
    });
  }

  _openEditModal(): void {
    const modalRef: NgbModalRef = this.modalService.open(SearchFilterEditorModalComponent);
    const instance: SearchFilterEditorModalComponent = modalRef.componentInstance;
    const key = this.searchFilterService.getKeyByFilterComponentInstance(this);
    instance.fields = [...this.editFields];
    instance.model = { [key]: UtilsService.cloneValue(this.value) };
    this.editModel = { ...instance.model };
    instance.form = this.editForm;

    const applyValue = (value: any) => {
      this.value = value;
      this.valueChanges.emit(this.value);
    };

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

  getMatchTypeField(listKey: string, stringSeparator = ","): FormlyFieldConfig {
    return {
      key: `matchType`,
      type: "ng-select",
      wrappers: ["default-wrapper"],
      expressions: {
        className: () => {
          let value = this.editForm.get(listKey).value;
          if (UtilsService.isString(value)) {
            value = value.split(stringSeparator);
          }
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
            label: this.searchFilterService.humanizeMatchType(MatchType.ALL)
          },
          {
            value: MatchType.ANY,
            label: this.searchFilterService.humanizeMatchType(MatchType.ANY)
          }
        ]
      },
      hooks: {
        onInit: field => {
          if (this.editForm.get(listKey)) {
            this.editForm.get(listKey).valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
              if (UtilsService.isString(value)) {
                value = value.split(stringSeparator);
              }

              if (!value || value.length <= 1) {
                field.formControl.setValue(null);
              } else if (field.formControl.value === null) {
                field.formControl.setValue(MatchType.ANY);
              }
            });
          }
        }
      }
    };
  }
}
