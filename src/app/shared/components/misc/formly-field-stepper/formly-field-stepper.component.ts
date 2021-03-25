import { Component, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
export class FormlyFieldStepperComponent extends FieldType implements OnInit {
  @ViewChild("wizard")
  wizard: NgWizardComponent;

  @ViewChildren("wizardSteps")
  wizardSteps: QueryList<NgWizardStepComponent>;

  currentStepIndex = 0;

  highestVisitedStep = 0;

  constructor(
    public readonly ngWizardService: NgWizardService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.route.fragment.subscribe((fragment: string) => {
      this.currentStepIndex = +fragment - 1;
      this.ngWizardService.show(this.currentStepIndex);
    });
  }

  onStepChanged(event?: StepChangedArgs) {
    this.router.navigate([], { fragment: "" + (event.step.index + 1) }).then(() => {
      this.markPreviousStepsAsDone(event.step.index);
      this.setHighestVisitedStep(event.step.index);
    });
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
    if (event) {
      event.preventDefault();
    }

    this.ngWizardService.previous();
    this.windowRef.scroll({ top: 0 });
  }

  goToNextStep(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    this.ngWizardService.next();
    this.windowRef.scroll({ top: 0 });
  }

  public markPreviousStepsAsDone(stepIndex: number) {
    this.wizardSteps.forEach((step, index) => {
      if (index < stepIndex) {
        (step.status as any) = "done";
      }
    });
  }

  public setHighestVisitedStep(stepIndex: number) {
    if (stepIndex > this.highestVisitedStep) {
      this.highestVisitedStep = stepIndex;
    }
  }
}
