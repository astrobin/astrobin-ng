import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SafeHtml } from "@angular/platform-browser";
import { SearchAutoCompleteType } from "@features/search/services/search.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { LabelType } from "@angular-slider/ngx-slider";

@Component({
  selector: "astrobin-base-slider-size-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export abstract class SearchBaseSliderFilterComponent extends SearchBaseFilterComponent {
  abstract unit: string;
  editFields: FormlyFieldConfig[];

  initFields(key: SearchAutoCompleteType, floor: number, ceil: number): void {
    this.editFields = [
      {
        key,
        type: "slider",
        wrappers: ["default-wrapper"],
        props: {
          label: this.label,
          required: true,
          sliderOptions: {
            floor,
            ceil,
            translate: (value: number, label: LabelType): string => {
              switch (label) {
                case LabelType.Low:
                  return `${this.translateService.instant("Min")} ${value} ${this.unit}`;
                case LabelType.High:
                  return `${this.translateService.instant("Max")} ${value} ${this.unit}`;
                default:
                  return `${value} ${this.unit}`;
              }
            }
          }
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            if (!this.editModel[key]) {
              field.formControl.setValue({
                min: floor,
                max: ceil
              });
            }
          }
        }
      }
    ];
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    return this.domSanitizer.bypassSecurityTrustHtml(`${this.value.min} - ${this.value.max} ${this.unit}`);
  }
}
