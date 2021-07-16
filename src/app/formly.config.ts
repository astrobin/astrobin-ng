import { FormControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { FormlyFieldImageCropperComponent } from "@shared/components/misc/formly-field-image-cropper/formly-field-image-cropper.component";
import { FormlyFieldNgSelectComponent } from "@shared/components/misc/formly-field-ng-select/formly-field-ng-select.component";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { FormlyFieldGoogleMapComponent } from "@shared/components/misc/formly-field-google-map/formly-field-google-map.component";
import { FormlyFieldCKEditorComponent } from "@shared/components/misc/formly-field-ckeditor/formly-field-ckeditor.component";

export interface FileSizeValidatorOptionsInterface {
  max: number;
}

function fileSizeValidator(
  control: FormControl,
  field: FormlyFieldConfig,
  options: FileSizeValidatorOptionsInterface
): ValidationErrors {
  let value;

  if (Array.isArray(control.value)) {
    value = control.value[0];
  } else {
    value = control.value;
  }
  return value?.size < options.max ? null : { "file-size": true };
}

function urlValidator(control: FormControl, field: FormlyFieldConfig): ValidationErrors {
  if (!control.value) {
    return null;
  }

  // See https://gist.github.com/dperini/729294
  const regex = new RegExp(
    "^" +
      // protocol identifier (optional)
      // short syntax // still required
      "(?:(?:(?:https?|ftps?):)?\\/\\/)" +
      // user:pass BasicAuth (optional)
      "(?:\\S+(?::\\S*)?@)?" +
      "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broadcast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
      "|" +
      // host & domain names, may end with dot
      // can be replaced by a shortest alternative
      // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
      "(?:" +
      "(?:" +
      "[a-z0-9\\u00a1-\\uffff]" +
      "[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
      ")?" +
      "[a-z0-9\\u00a1-\\uffff]\\." +
      ")+" +
      // TLD identifier name, may end with dot
      "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
      ")" +
      // port number (optional)
      "(?::\\d{2,5})?" +
      // resource path (optional)
      "(?:[/?#]\\S*)?" +
      "$",
    "i"
  );

  return regex.test(control.value) ? null : { url: true };
}

export function formlyValidationConfig(translate: TranslateService) {
  return {
    types: [
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
    validators: [
      { name: "file-size", validation: fileSizeValidator },
      { name: "url", validation: urlValidator }
    ],
    validationMessages: [
      {
        name: "required",
        message() {
          return translate.stream("This field is required");
        }
      },
      {
        name: "url",
        message() {
          return translate.stream("This field needs to be a valid URL starting with http(s) or ftp(s)");
        }
      }
    ]
  };
}
