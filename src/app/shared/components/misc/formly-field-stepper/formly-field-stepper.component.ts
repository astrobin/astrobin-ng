import { Component, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import {
  NgWizardComponent,
  NgWizardService,
  NgWizardStep,
  NgWizardStepComponent,
  STEP_STATE,
  StepChangedArgs
} from "ng-wizard";

@Component({
  selector: "astrobin-formly-field-stepper",
  templateUrl: "./formly-field-stepper.component.html",
  styleUrls: ["./formly-field-stepper.component.scss"]
})
export class FormlyFieldStepperComponent extends FieldType {
  @ViewChild("wizard")
  wizard: NgWizardComponent;

  @ViewChildren("wizardSteps")
  wizardSteps: QueryList<NgWizardStepComponent>;

  highestVisitedStep = 0;

  constructor(
    public readonly ngWizardService: NgWizardService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService
  ) {
    super();
  }

  onStepChanged(event?: StepChangedArgs) {
    this.wizardSteps.forEach((step, index) => {
      if (index < event.step.index) {
        (step.status as any) = "done";
      }
    });

    if (event.step.index > this.highestVisitedStep) {
      this.highestVisitedStep = event.step.index;
    }
  }

  getStep(stepNumber: number): NgWizardStep {
    if (!this.wizard) {
      return null;
    }

    return this.wizard.steps.get(stepNumber);
  }

  isStepErrored(stepNumber: number): boolean {
    const step: NgWizardStep = this.getStep(stepNumber);
    return step?.state === "error";
  }

  getStepTitle(stepNumber: number): string {
    let title = this.translateService.instant("Step {{ stepNumber }}", { stepNumber: stepNumber + 1 });

    if (this.isStepErrored(stepNumber)) {
      title += "*";
    }

    return title;
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

  onSave(event?: Event) {
    event.preventDefault();

    if (!this.form.valid) {
      this.popNotificationsService.error(this.translateService.instant("The form is incomplete or has errors."), null, {
        timeOut: 10000
      });
      return;
    }

    if (this.to.onSave !== undefined) {
      this.to.onSave();
    }
  }
}
