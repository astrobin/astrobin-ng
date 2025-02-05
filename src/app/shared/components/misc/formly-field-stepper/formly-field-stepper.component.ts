import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, Renderer2, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgWizardComponent, NgWizardService, NgWizardStep, NgWizardStepComponent, STEP_STATE, StepChangedArgs } from "@kronscht/ng-wizard";
import { isPlatformServer } from "@angular/common";
import { Subscription } from "rxjs";
import { DeviceService } from "@core/services/device.service";
import { UtilsService } from "@core/services/utils/utils.service";

@Component({
  selector: "astrobin-formly-field-stepper",
  templateUrl: "./formly-field-stepper.component.html",
  styleUrls: ["./formly-field-stepper.component.scss"]
})
export class FormlyFieldStepperComponent
  extends FieldType
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

  private _routeFragmentSubscription: Subscription;

  constructor(
    public readonly ngWizardService: NgWizardService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly route: ActivatedRoute,
    public readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly deviceService: DeviceService,
    public readonly utilsService: UtilsService
  ) {
    super();
  }

  ngOnInit() {
    this._routeFragmentSubscription = this.route.fragment.subscribe((fragment: string) => {
      if (!fragment) {
        this.currentStepIndex = 0;
      } else {
        this.currentStepIndex = +fragment - 1;
      }
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

    if (!!this._routeFragmentSubscription) {
      this._routeFragmentSubscription.unsubscribe();
    }
  }

  ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  onStepChanged(event?: StepChangedArgs) {
    if (!event.previousStep) {
      return;
    }

    this.router.navigate([], { fragment: "" + (event.step.index + 1) }).then(() => {
      this.markPreviousStepsAsDone(event.step.index);
      this.setHighestVisitedStep(event.step.index);
      this.utilsService.delay(100).subscribe(() => {
        this._scrollActiveNavItemIntoView();
      })
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
    let title = field.props.label;

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
  }

  goToNextStep(event: Event, index: number) {
    if (event) {
      event.preventDefault();
    }

    this._markFieldAsTouched(this.field.fieldGroup[index]);
    this.ngWizardService.next();
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

  private _scrollActiveNavItemIntoView(): void {
    if (isPlatformServer(this.platformId) || !this.deviceService.isTouchEnabled() || !this.wizardElement) {
      return;
    }

    const nav = this.wizardElement.nativeElement.querySelector("ul.nav");

    if (!nav) {
      return;
    }

    const activeItem = nav.querySelector("li.nav-item.active");

    if (!activeItem) {
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    // If active item is fully visible, do nothing.
    if (itemRect.left >= navRect.left && itemRect.right <= navRect.right) {
      return;
    }

    // Scroll so that the active item is left-aligned.
    nav.scrollTo({
      left: activeItem.offsetLeft,
      behavior: "smooth"
    });
  }
}
