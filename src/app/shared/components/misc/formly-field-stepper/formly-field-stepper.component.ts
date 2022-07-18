import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from "@angular/core";
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
import { isPlatformServer } from "@angular/common";

@Component({
  selector: "astrobin-formly-field-stepper",
  templateUrl: "./formly-field-stepper.component.html",
  styleUrls: ["./formly-field-stepper.component.scss"]
})
export class FormlyFieldStepperComponent extends FieldType
  implements OnInit, AfterViewInit, OnDestroy, AfterContentChecked {
  @ViewChild("wizard")
  wizard: NgWizardComponent;

  @ViewChild("wizard", { read: ElementRef })
  wizardElement: ElementRef;

  @ViewChildren("wizardSteps")
  wizardSteps: QueryList<NgWizardStepComponent>;

  currentStepIndex = 0;

  highestVisitedStep = 0;

  private _stepClickListeners = [];

  constructor(
    public readonly ngWizardService: NgWizardService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly route: ActivatedRoute,
    public readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) public readonly platformId,
    public readonly cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.route.fragment.subscribe((fragment: string) => {
      this.currentStepIndex = +fragment - 1;
      this.ngWizardService.show(this.currentStepIndex);
    });
  }

  ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const anchors: HTMLAnchorElement[] = this.wizardElement.nativeElement.querySelectorAll("a");
    anchors.forEach(anchor => {
      this._stepClickListeners.push(
        this.renderer.listen(anchor, "click", (event: Event) => {
          this._markFieldAsTouched(this.field.fieldGroup[this.currentStepIndex]);
        })
      );
    });
  }

  ngOnDestroy() {
    this._stepClickListeners.forEach(listener => {
      listener();
    });
  }

  ngAfterContentChecked(): void {
    this.cd.detectChanges();
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

  getStepTitle(field: FormlyFieldConfig, stepNumber: number): string {
    let title = field.templateOptions.label;

    if (this.isStepErrored(stepNumber)) {
      title += "*";
    }

    return title;
  }

  isValid(field: FormlyFieldConfig) {
    if (!field.formControl) {
      return false;
    }

    if (field.key) {
      return !field.formControl.invalid && !field.formControl.pending;
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

  goToPreviousStep(event: Event, index: number) {
    if (event) {
      event.preventDefault();
    }

    this._markFieldAsTouched(this.field.fieldGroup[index]);
    this.ngWizardService.previous();
    this.windowRef.scroll({ top: 0 });
  }

  goToNextStep(event: Event, index: number) {
    if (event) {
      event.preventDefault();
    }

    this._markFieldAsTouched(this.field.fieldGroup[index]);
    this.ngWizardService.next();
    this.windowRef.scroll({ top: 0 });
  }

  markPreviousStepsAsDone(stepIndex: number) {
    this.wizardSteps.forEach((step, index) => {
      if (index < stepIndex) {
        (step.status as any) = "done";
      }
    });
  }

  setHighestVisitedStep(stepIndex: number) {
    if (stepIndex > this.highestVisitedStep) {
      this.highestVisitedStep = stepIndex;
    }
  }

  _markFieldAsTouched(fieldConfig: FormlyFieldConfig) {
    if (!fieldConfig) {
      return;
    }

    if (!!fieldConfig.fieldGroup) {
      for (const subFieldConfig of fieldConfig.fieldGroup) {
        this._markFieldAsTouched(subFieldConfig);
      }
    } else {
      fieldConfig.formControl.markAsTouched({ onlySelf: true });
    }
  }
}
