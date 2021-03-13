import { Component } from "@angular/core";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { NgWizardService, STEP_STATE } from "ng-wizard";

@Component({
  selector: "astrobin-formly-field-stepper",
  templateUrl: "./formly-field-stepper.component.html",
  styleUrls: ["./formly-field-stepper.component.scss"]
})
export class FormlyFieldStepperComponent extends FieldType {
  constructor(
    public readonly ngWizardService: NgWizardService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService
  ) {
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

  getState(field: FormlyFieldConfig): STEP_STATE {
    if (!this.isValid(field)) {
      return STEP_STATE.error;
    }

    return STEP_STATE.normal;
  }

  isFirstStep(index): boolean {
    return index === 0;
  }

  isLastStep(index): boolean {
    return index === this.field.fieldGroup.length - 1;
  }

  goToPreviousStep(event?: Event) {
    event.preventDefault();
    this.ngWizardService.previous();
    this.windowRef.nativeWindow.scroll({ top: 0, behavior: "smooth" });
  }

  goToNextStep(event?: Event) {
    event.preventDefault();
    this.ngWizardService.next();
    this.windowRef.nativeWindow.scroll({ top: 0, behavior: "smooth" });
  }

  save() {}
}
