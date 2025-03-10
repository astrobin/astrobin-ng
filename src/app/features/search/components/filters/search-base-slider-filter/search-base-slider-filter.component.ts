import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SafeHtml } from "@angular/platform-browser";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-base-slider-size-filter.search-filter-component",
  template: ""
})
export abstract class SearchBaseSliderFilterComponent extends SearchBaseFilterComponent {
  abstract unit: string;
  editFields: FormlyFieldConfig[];

  protected initFields(key: SearchAutoCompleteType, options: Options = {}): void {
    this.editFields = [
      {
        key,
        type: "slider",
        wrappers: ["default-wrapper"],
        props: {
          label: this.label,
          required: true,
          showInputs: true,
          sliderOptions: {
            translate: (value: number, label: LabelType): string => {
              switch (label) {
                case LabelType.Low:
                  return `${this.translateService.instant("Min")} ${value} ${this.unit}`;
                case LabelType.High:
                  return `${this.translateService.instant("Max")} ${value} ${this.unit}`;
                default:
                  return `${value} ${this.unit}`;
              }
            },
            ...options
          }
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            if (!this.editModel[key]) {
              field.formControl.setValue({
                min: options.floor,
                max: options.ceil
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
