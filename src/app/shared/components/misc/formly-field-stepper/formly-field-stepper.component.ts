import { Component } from "@angular/core";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-formly-field-stepper",
  templateUrl: "./formly-field-stepper.component.html",
  styleUrls: ["./formly-field-stepper.component.scss"]
})
export class FormlyFieldStepperComponent extends FieldType {
  constructor(public translateService: TranslateService) {
    super();
  }

  getStepTitle(stepNumber: number): string {
    return this.translateService.instant("Step {{ stepNumber }}", { stepNumber });
  }

  isValid(field: FormlyFieldConfig) {
    if (field.key) {
      return field.formControl.valid;
    }

    return field.fieldGroup.every(f => this.isValid(f));
  }
}
