import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-field-toggle",
  templateUrl: "./formly-field-toggle.component.html",
  styleUrls: ["./formly-field-toggle.component.scss"]
})
export class FormlyFieldToggleComponent extends FieldType {
  onToggle(value: boolean): void {
    this.formControl.setValue(value);
  }
}
