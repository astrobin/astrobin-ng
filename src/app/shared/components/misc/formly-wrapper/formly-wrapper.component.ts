import { Component } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-wrapper",
  templateUrl: "./formly-wrapper.component.html"
})
export class FormlyWrapperComponent extends FieldWrapper {}
