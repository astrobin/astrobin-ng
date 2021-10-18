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
      }
    ],
    validationMessages: [
      {
        name: "required",
        message() {
          return translateService.instant("This field is required");
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
        name: "image-file",
        message: () => translateService.instant("This file is not an image.")
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

          if (Array.isArray(control.value) || control.value instanceof FileList) {
            value = control.value[0];
          } else {
            value = control.value;
          }

          return !value || UtilsService.isString(value) || value?.size < options.max ? null : { "file-size": true };
        }
      },
      {
        name: "image-file",
        validation: (control: FormControl, field: FormlyFieldConfig): ValidationErrors => {
          let value;

          if (Array.isArray(control.value) || control.value instanceof FileList) {
            value = control.value[0];
          } else {
            value = control.value;
          }

          return !value || UtilsService.isString(value) || UtilsService.isImage(value.name)
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
            return of(null);
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
          options: { minControl: string; maxControl: string; minLabel: string; maxLabel: string }
        ): ValidationErrors => {
          if (!control?.value || !control?.value[options.minControl] || !control?.value[options.maxControl]) {
            return null;
          }

          if (control.value[options.maxControl] < control.value[options.minControl]) {
            return {
              "max-greater-equal-than-min": { minLabel: options.minLabel, maxLabel: options.maxLabel }
            };
          }

          return null;
        }
      }
    ]
  };
}
