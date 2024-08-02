import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { BortleScale } from "@shared/interfaces/deep-sky-acquisition.interface";
import { ImageService } from "@shared/services/image/image.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-search-bortle-scale-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchBortleScaleFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.BORTLE_SCALE;
  label = this.searchService.humanizeSearchAutoCompleteType(
    SearchBortleScaleFilterComponent.key as SearchAutoCompleteType
  );
  minLabel = this.translateService.instant("Minimum Bortle scale");
  maxLabel = this.translateService.instant("Maximum Bortle scale");
  options = Object.values(BortleScale).filter(v => isNaN(Number(v))).map(value => ({
    value: BortleScale[value],
    label: this.imageService.humanizeBortleScale(BortleScale[value])
  })).sort(
    (a, b) => {
      if (a.value < b.value) {
        return -1;
      } else if (a.value > b.value) {
        return 1;
      } else {
        return 0;
      }
    }
  );
  editFields = [
    {
      key: SearchBortleScaleFilterComponent.key,
      fieldGroup: [
        {
          key: "min",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          props: {
            required: true,
            label: this.minLabel,
            options: this.options
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                this.utilsService.delay(1).subscribe(() => {
                  this.editForm.get("bortle_scale.max")?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                });
              });
            }
          },
          validators: {
            validation: [
              {
                name: "min-less-than-max",
                options: {
                  model: this.editModel,
                  maxValueKey: "bortle_scale.max",
                  minLabel: this.minLabel,
                  maxLabel: this.maxLabel
                }
              }
            ]
          }
        },
        {
          key: "max",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          props: {
            required: true,
            label: this.maxLabel,
            options: this.options
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                this.utilsService.delay(1).subscribe(() => {
                  this.editForm.get("bortle_scale.min")?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                });
              });
            }
          },
          validators: {
            validation: [
              {
                name: "max-greater-equal-than-min",
                options: {
                  model: this.editModel,
                  minValueKey: "bortle_scale.min",
                  minLabel: this.minLabel,
                  maxLabel: this.maxLabel
                }
              }
            ]
          }
        }
      ],
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!this.editModel.bortle_scale) {
            field.formControl.setValue({
              min: BortleScale.ONE,
              max: BortleScale.NINE
            });
          }
        }
      }
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchService);
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const minimum = this.imageService.humanizeBortleScale(this.value.min);
    const maximum = this.imageService.humanizeBortleScale(this.value.max);
    return this.domSanitizer.bypassSecurityTrustHtml(`${minimum} &rarr; ${maximum}`);
  }
}
