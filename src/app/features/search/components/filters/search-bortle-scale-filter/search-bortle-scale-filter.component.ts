import { Component } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { BortleScale } from "@core/interfaces/deep-sky-acquisition.interface";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import { ImageService } from "@core/services/image/image.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-search-bortle-scale-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchBortleScaleFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.BORTLE_SCALE;

  readonly category = SearchFilterCategory.SKY_AND_SUBJECTS;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(
    SearchBortleScaleFilterComponent.key as SearchAutoCompleteType
  );
  readonly minLabel = this.translateService.instant("Minimum Bortle scale");
  readonly maxLabel = this.translateService.instant("Maximum Bortle scale");
  readonly options = Object.values(BortleScale)
    .filter(v => isNaN(Number(v)))
    .map(value => ({
      value: BortleScale[value],
      label: this.imageService.humanizeBortleScale(BortleScale[value])
    }))
    .sort((a, b) => {
      if (a.value < b.value) {
        return -1;
      } else if (a.value > b.value) {
        return 1;
      } else {
        return 0;
      }
    });
  editFields = [
    {
      key: SearchBortleScaleFilterComponent.key,
      fieldGroup: [
        {
          key: "min",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          props: {
            searchable: false,
            required: true,
            label: this.minLabel,
            options: this.options
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
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
            searchable: false,
            required: true,
            label: this.maxLabel,
            options: this.options
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
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
    public readonly searchFilterService: SearchFilterService,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
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
