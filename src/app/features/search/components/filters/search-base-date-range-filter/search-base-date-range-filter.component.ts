import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { DateService } from "@core/services/date.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-base-data-range-filter.search-filter-component",
  template: ""
})
export abstract class SearchBaseDateRangeFilterComponent extends SearchBaseFilterComponent {
  editFields: FormlyFieldConfig[];
  private readonly _minLabel = this.translateService.instant("From");
  private readonly _maxLabel = this.translateService.instant("To");

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly utilsService: UtilsService,
    public readonly dateService: DateService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const from = new Date(this.value.min).toLocaleDateString(this.translateService.currentLang);
    const to = new Date(this.value.max).toLocaleDateString(this.translateService.currentLang);

    return this.domSanitizer.bypassSecurityTrustHtml(`${from} &rarr; ${to}`);
  }

  protected initFields(key: string): void {
    const supportsDateInput = this.utilsService.supportsDateInput();

    this.editFields = [
      {
        key,
        fieldGroup: [
          {
            key: "min",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: supportsDateInput ? "date" : "datepicker",
              required: true,
              label: this._minLabel,
              placeholder: supportsDateInput ? "" : "YYYY-MM-DD"
            },
            hooks: {
              onInit: (field: FormlyFieldConfig) => {
                field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                  this.utilsService.delay(1).subscribe(() => {
                    this.editForm.get(`${key}.max`)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                  });
                });
              }
            },
            validators: {
              validation: [
                {
                  name: "min-date",
                  options: {
                    value: new Date(1900, 0, 1)
                  }
                },
                {
                  name: "max-date",
                  options: {
                    value: new Date()
                  }
                },
                {
                  name: "min-less-than-max",
                  options: {
                    model: this.editModel,
                    maxValueKey: `${key}.max`,
                    minLabel: this._minLabel,
                    maxLabel: this._maxLabel
                  }
                }
              ]
            }
          },
          {
            key: "max",
            type: "input",
            wrappers: ["default-wrapper"],
            props: {
              type: supportsDateInput ? "date" : "datepicker",
              required: true,
              label: this.translateService.instant("To"),
              placeholder: supportsDateInput ? "" : "YYYY-MM-DD"
            },
            hooks: {
              onInit: (field: FormlyFieldConfig) => {
                field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                  this.utilsService.delay(1).subscribe(() => {
                    this.editForm.get(`${key}.min`)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                  });
                });
              }
            },
            validators: {
              validation: [
                {
                  name: "min-date",
                  options: {
                    value: new Date(1900, 0, 1)
                  }
                },
                {
                  name: "max-greater-equal-than-min",
                  options: {
                    model: this.editModel,
                    minValueKey: `${key}.min`,
                    minLabel: this._minLabel,
                    maxLabel: this._maxLabel
                  }
                }
              ]
            }
          }
        ],
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            if (!this.editModel[key]) {
              field.formControl.setValue({
                min: "1900-01-01",
                max: this.dateService.todayISODate()
              });
            }
          }
        }
      }
    ];
  }
}
