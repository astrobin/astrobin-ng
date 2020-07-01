import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";

export const formlyConfig = {
  types: [
    {
      name: "chunked-file",
      component: FormlyFieldChunkedFileComponent,
      wrappers: ["form-field"]
    }
  ]
};
