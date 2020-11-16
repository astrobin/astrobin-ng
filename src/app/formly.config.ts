import { FormControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";

export interface FileSizeValidatorOptionsInterface {
  max: number;
}

function fileSizeValidator(
  control: FormControl,
  field: FormlyFieldConfig,
  options: FileSizeValidatorOptionsInterface
): ValidationErrors {
  return control.value?.length && control.value[0]?.size < options.max ? null : { "file-size": true };
}

export const formlyConfig = {
  types: [
    {
      name: "chunked-file",
      component: FormlyFieldChunkedFileComponent,
      wrappers: ["form-field"]
    }
  ],
  validators: [{ name: "file-size", validation: fileSizeValidator }]
};
