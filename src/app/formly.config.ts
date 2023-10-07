import { FormControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { FormlyFieldImageCropperComponent } from "@shared/components/misc/formly-field-image-cropper/formly-field-image-cropper.component";
import { FormlyFieldNgSelectComponent } from "@shared/components/misc/formly-field-ng-select/formly-field-ng-select.component";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { FormlyFieldGoogleMapComponent } from "@shared/components/misc/formly-field-google-map/formly-field-google-map.component";
import { FormlyFieldCKEditorComponent } from "@shared/components/misc/formly-field-ckeditor/formly-field-ckeditor.component";
import { FormlyFieldFileComponent } from "@shared/components/misc/formly-field-file/formly-field-file.component";
import { UtilsService } from "@shared/services/utils/utils.service";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { debounceTime, distinctUntilChanged, first, startWith, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import { FormlyFieldEquipmentItemBrowserComponent } from "@shared/components/misc/formly-field-equipment-item-browser/formly-field-equipment-item-browser.component";
import { FormlyFieldTableComponent } from "@shared/components/misc/formly-field-table/formly-field-table.component";
import { FormlyFieldButtonComponent } from "@shared/components/misc/formly-field-button/formly-field-button.component";
import { FormlyFieldToggleComponent } from "@shared/components/misc/formly-field-toggle/formly-field-toggle.component";

export interface FileSizeValidatorOptionsInterface {
  max: number;
}

export function formlyConfig(translateService: TranslateService, jsonApiService: JsonApiService) {
  return {
    types: [
      {
        name: "file",
        component: FormlyFieldFileComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "chunked-file",
        component: FormlyFieldChunkedFileComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "stepper",
        component: FormlyFieldStepperComponent,
        wrappers: []
      },
      {
        name: "ng-select",
        component: FormlyFieldNgSelectComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "image-cropper",
        component: FormlyFieldImageCropperComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "google-map",
        component: FormlyFieldGoogleMapComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "ckeditor",
        component: FormlyFieldCKEditorComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "equipment-item-browser",
        component: FormlyFieldEquipmentItemBrowserComponent,
        wrappers: ["equipment-item-browser-wrapper"]
      },
      {
        name: "table",
        component: FormlyFieldTableComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "button",
        component: FormlyFieldButtonComponent,
        wrappers: ["default-wrapper"]
      },
      {
        name: "toggle",
        component: FormlyFieldToggleComponent,
        wrappers: ["default-wrapper"]
      }
    ],
    validationMessages: [
      {
        name: "required",
        message() {
          return translateService.instant("This field is required.");
        }
      },
      {
        name: "file-size",
        message: () =>
          translateService.instant(
            "This file is too large. Please check the size requirement in the field's description."
          )
      },
      {
        name: "image-or-video-file",
        message: () => translateService.instant("This file is not an image or a video.")
      },
      {
        name: "url",
        message: () => translateService.instant("This does not look like a valid URL.")
      },
      {
        name: "url-is-available",
        message: () => translateService.instant("AstroBin could not connect to this server.")
      },
      {
        name: "max-greater-equal-than-min",
        message(options: { minLabel: string; maxLabel: string }) {
          return translateService.instant(`"{{0}}" cannot be smaller than "{{1}}".`, {
            0: options.maxLabel,
            1: options.minLabel
          });
        }
      },
      {
        name: "number",
        message: translateService.instant("This value should be a number.")
      },
      {
        name: "whole-number",
        message: translateService.instant("This value should be a whole number.")
      },
      {
        name: "min-value",
        message(options: { minValue: number }): string {
          return translateService.instant("This value must be equal to or greater than {{0}}.", {
            0: options.minValue
          });
        }
      },
      {
        name: "min",
        message(options: { min: number }): string {
          return translateService.instant("This value must be equal to or greater than {{0}}.", {
            0: options.min
          });
        }
      },
      {
        name: "max-value",
        message(options: { maxValue: number }): string {
          return translateService.instant("This value must be equal to or smaller than {{0}}.", {
            0: options.maxValue
          });
        }
      },
      {
        name: "max",
        message(options: { maxValue: number }): string {
          return translateService.instant("This value must be equal to or smaller than {{0}}.", {
            0: options.maxValue
          });
        }
      },
      {
        name: "is-date",
        message(options: { format: string }): string {
          return translateService.instant("This is not a valid date. Please use the format {{0}}.", {
            0: options.format
          });
        }
      },
      {
        name: "max-date",
        message(options: { value: Date }): string {
          return translateService.instant("This date must not be after {{0}}.", {
            0: options.value.toDateString()
          });
        }
      },
      {
        name: "max-decimals",
        message(options: { value: number }): string {
          return translateService.instant("This value must have {{0}} decimal digits or less.", {
            0: options.value
          });
        }
      },
      {
        name: "has-canon-multi-name",
        message(): string {
          return translateService.instant(
            "This camera already exists in AstroBin's database. Certain Canon cameras have multiple names for " +
            "multiple markets (e.g. EOS / Rebel / Kiss) and they are grouped as a single item on AstroBin for " +
            "simplicity."
          );
        }
      },
      {
        name: "has-tripod-as-accessory",
        message(): string {
          return translateService.instant("Tripods must be added in the Mounts equipment class.");
        }
      },
      {
        name: "filter-name-lacks-size",
        message(): string {
          return translateService.instant(
            "The name of the filter must end with its size in parentheses, as found from the Size selection " +
            "dropdown, e.g.: (Round 50mm)."
          );
        }
      },
      {
        name: "has-oag-in-wrong-class",
        message(): string {
          return translateService.instant(
            "Off-axis guiders are found among Accessories. Please find your item in that category, thanks!"
          );
        }
      },
      {
        name: "has-hyperstar-in-wrong-class",
        message(): string {
          return translateService.instant(
            "The Starizona Hyperstar models are found among Accessories. Please find your item in that category, thanks!"
          );
        }
      },
      {
        name: "has-teleconverter-in-wrong-class",
        message(): string {
          return translateService.instant(
            "Teleconverters are found among Accessories. Please find your item in that category, thanks!"
          );
        }
      },
      {
        name: "has-lacerta-mgen-in-wrong-class",
        message(): string {
          return translateService.instant(
            "Lacerta MGEN standalone autoguiders are found among Accessories. Please find your item in that category, thanks!"
          );
        }
      },
      {
        name: "has-skywatcher-without-dash",
        message(): string {
          return translateService.instant("Sky-Watcher is spelled with a dash sign.");
        }
      },
      {
        name: "enum-value",
        message(): string {
          return translateService.instant("This value is not valid.");
        }
      },
      {
        name: "invalid-csv",
        message(): string {
          return translateService.instant("This is not a valid comma-separated value (CSV).");
        }
      },
      {
        name: "invalid-csv-missing-header-line",
        message(): string {
          return translateService.instant("The comma-separated value must have a header line.");
        }
      },
      {
        name: "invalid-csv-unexpected-header",
        message(options: { unexpectedHeaders: string[] } = { unexpectedHeaders: [] }): string {
          return translateService.instant(
            "The CSV header contains unexpected values: {{0}}.",
            {
              0: options.unexpectedHeaders.join(", ")
            }
          );
        }
      },
      {
        name: "invalid-csv-missing-required-header",
        message(options: { requiredHeaders: string[] } = { requiredHeaders: [] }): string {
          return translateService.instant(
            "The CSV header does not contain the following mandatory values: {{0}}.",
            {
              0: options.requiredHeaders.join(", ")
            }
          );
        }
      }
    ],
    validators: [
      {
        name: "file-size",
        validation: (
          control: FormControl,
          field: FormlyFieldConfig,
          options: FileSizeValidatorOptionsInterface
        ): ValidationErrors => {
          let value;

          if (typeof FileList === "undefined") {
            return null;
          }

          if (Array.isArray(control.value) || control.value instanceof FileList) {
            value = control.value[0];
          } else {
            value = control.value;
          }

          return !value || UtilsService.isString(value) || value?.size < options.max ? null : { "file-size": true };
        }
      },
      {
        name: "image-or-video-file",
        validation: (control: FormControl, field: FormlyFieldConfig): ValidationErrors => {
          let value;

          if (Array.isArray(control.value) || control.value instanceof FileList) {
            value = control.value[0];
          } else {
            value = control.value;
          }

          return !value ||
          UtilsService.isString(value) ||
          UtilsService.isImage(value.name) ||
          UtilsService.isVideo(value.name)
            ? null
            : { "image-file": true };
        }
      },
      {
        name: "url",
        validation: (control: FormControl, field: FormlyFieldConfig): ValidationErrors => {
          if (!control.value) {
            return null;
          }

          return UtilsService.isUrl(control.value) ? null : { url: true };
        }
      },
      {
        name: "url-is-available",
        validation: (control: FormControl): ValidationErrors => {
          if (!control.value) {
            return of(true);
          }

          return control.valueChanges.pipe(
            startWith(control.value),
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(value => jsonApiService.urlIsAvailable(value)),
            first()
          );
        }
      },
      {
        name: "max-greater-equal-than-min",
        validation: (
          control: FormControl,
          field: FormlyFieldConfig,
          options: { model: any; minValueKey: string; minLabel: string; maxLabel: string }
        ): ValidationErrors => {
          if (
            !options.model ||
            !options.minValueKey ||
            options.model[options.minValueKey] === null ||
            options.model[options.minValueKey] === undefined
          ) {
            return null;
          }

          if (control.value < options.model[options.minValueKey]) {
            return {
              "max-greater-equal-than-min": { minLabel: options.minLabel, maxLabel: options.maxLabel }
            };
          }

          return null;
        }
      },
      {
        name: "number",
        validation: (control: FormControl) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          return /^\d+\.\d+$|^\d+$/.test(control.value) ? null : { number: true };
        }
      },
      {
        name: "whole-number",
        validation: (control: FormControl) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          if (!/^[-+]?\d+\.\d+$|^[-+]?\d+$/.test(control.value)) {
            return { "whole-number": true };
          }

          return Number.isInteger(parseFloat(control.value)) ? null : { "whole-number": true };
        }
      },
      {
        name: "min-value",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { minValue: number }) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          return parseFloat(control.value) >= options.minValue ? null : { "min-value": options };
        }
      },
      {
        name: "max-value",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { maxValue: number }) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          return parseFloat(control.value) <= options.maxValue ? null : { "max-value": options };
        }
      },
      {
        name: "is-date",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { format: string }) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          return !isNaN(new Date(control.value).getTime()) ? null : { "is-date": options };
        }
      },
      {
        name: "max-date",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { value: Date }) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          const d = new Date(control.value);

          if (isNaN(d.getTime())) {
            return null;
          }

          return d <= options.value ? null : { "max-date": options };
        }
      },
      {
        name: "max-decimals",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { value: number }) => {
          const countDecimals = (num: number) => {
            if (Math.floor(num) === num) {
              return 0;
            }

            const split = num.toString().split(".");

            if (split.length === 1 || split[1].length === 0) {
              return 0;
            }

            return split[1].length || 0;
          };

          if (control.value === null || control.value === undefined) {
            return null;
          }

          return countDecimals(control.value) <= options.value ? null : { "max-decimals": options };
        }
      },
      {
        name: "enum-value",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { allowedValues: any[] }) => {
          if (control.value === null || control.value === undefined) {
            return null;
          }

          return options.allowedValues.includes(control.value) ? null : { "enum-value": options };
        }
      },
      {
        name: "csv",
        validation: (control: FormControl, field: FormlyFieldConfig, options: { requiredHeaders: string[], allowedHeaders: string[] }) => {
          const hasRequiredHeaders = (header: string[], requiredHeaders: string[]): boolean => {
            return requiredHeaders.every(h => header.includes(h));
          };

          const findUnexpectedHeaders = (header: string[], allowedHeaders: string[]): string[] => {
            return header.filter(h => !allowedHeaders.includes(h));
          };

          const isValidCsv = (lines: string[], headerLength: number): boolean => {
            return lines.slice(1).every(line => {
              const row = line.split(",");
              return row.length === headerLength;
            });
          };

          const value = control.value;

          if (value === null || value === undefined) {
            return null;
          }

          const lines: string[] = value.split("\n");
          const header: string[] = lines[0].split(",");

          if (!isValidCsv(lines, header.length)) {
            return { "invalid-csv": true };
          }

          if (lines.filter(line => line !== "").length < 2) {
            return { "invalid-csv-missing-header-line": true };
          }

          if (!hasRequiredHeaders(header, options.requiredHeaders)) {
            return { "invalid-csv-missing-required-header": options };
          }

          const unexpectedHeaders = findUnexpectedHeaders(header, options.allowedHeaders);
          if (unexpectedHeaders.length > 0) {
            return { "invalid-csv-unexpected-header": { unexpectedHeaders } };
          }

          return null;
        }
      }
    ]
  };
}
