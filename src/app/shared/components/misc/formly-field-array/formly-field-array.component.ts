import { Component } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-field-array",
  templateUrl: "./formly-field-array.component.html",
  styleUrls: ["./formly-field-array.component.scss"]
})
export class FormlyFieldArrayComponent extends FieldArrayType {
}
