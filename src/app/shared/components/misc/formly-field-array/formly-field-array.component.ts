import { Component } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-field-array",
  templateUrl: "./formly-field-array.component.html",
  styleUrls: ["./formly-field-array.component.scss"]
})
export class FormlyFieldArrayComponent extends FieldArrayType {
  get props() {
    return (this.field.fieldArray as FormlyFieldConfig).props;
  }

  remove(i: number) {
    if (this.mayRemove(i)) {
      return super.remove(i, { markAsDirty: true });
    }

    return false;
  }

  mayAdd() {
    const mayAddFunction = this.props.mayAdd;
    const hasMayAddFunction = mayAddFunction && typeof mayAddFunction === "function";
    return hasMayAddFunction ? mayAddFunction() : true;
  }

  mayRemove(i: number) {
    const mayRemoveFunction = this.field.fieldGroup[i].props.mayRemove;
    const hasMayRemoveFunction = mayRemoveFunction && typeof mayRemoveFunction === "function";
    return hasMayRemoveFunction ? mayRemoveFunction(i) : true;
  }
}
