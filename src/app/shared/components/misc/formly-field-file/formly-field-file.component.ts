import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-field-file",
  templateUrl: "formly-field-file.component.html"
})
export class FormlyFieldFileComponent extends FieldType {
  fileChanged($event) {
    if ($event.target.files && $event.target.files[0]) {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        console.log(event.target.result);
        console.log(this.formControl);
        console.log(this.field.templateOptions.nextFields);
        // this.formControl.patchValue(event.target.result)
      };
      reader.readAsDataURL($event.target.files[0]);

      //reader.readAsText(event.target.files[0]);
    }
  }
}
