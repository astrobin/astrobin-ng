import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { UtilsService } from "@core/services/utils/utils.service";
import { NgWizardStep, StepChangedArgs, STEP_STATE } from "@kronscht/ng-wizard";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { FormlyFieldStepperComponent } from "./formly-field-stepper.component";

describe("FormlyFieldStepperComponent", () => {
  let component: FormlyFieldStepperComponent;
  let fixture: ComponentFixture<FormlyFieldStepperComponent>;

  beforeEach(async () => {
    await MockBuilder(FormlyFieldStepperComponent, AppModule).provide([
      {
        provide: ActivatedRoute,
        useValue: {
          fragment: of("1")
        }
      },
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldStepperComponent);
    component = fixture.componentInstance;
    component.field = {
      fieldGroup: []
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("onStepChanged", () => {
    it("should navigate to the step with index = fragment - 1", fakeAsync(() => {
      jest.spyOn(component.router, "navigate").mockReturnValue(Promise.resolve(true));
      jest.spyOn(component, "markPreviousStepsAsDone");
      jest.spyOn(component, "setHighestVisitedStep");

      component.onStepChanged({
        previousStep: {
          index: 1
        },
        step: {
          index: 2
        }
      } as StepChangedArgs);

      tick(101);

      expect(component.router.navigate).toHaveBeenCalledWith([], { fragment: "3" });
      expect(component.markPreviousStepsAsDone).toHaveBeenCalled();
      expect(component.setHighestVisitedStep).toHaveBeenCalled();
    }));
  });

  describe("getStep", () => {
    it("should work when there are no steps", () => {
      component.field = {
        fieldGroup: []
      };

      fixture.detectChanges();

      expect(component.getStep(0)).toBeUndefined();
    });

    it("should work when there there is a step", () => {
      component.field = {
        fieldGroup: [
          {
            props: { label: "1" },
            fieldGroup: []
          }
        ]
      };

      fixture.detectChanges();

      expect(component.getStep(0)).toBeDefined();
    });
  });

  describe("isStepErrored", () => {
    it("should work in case of error", () => {
      jest.spyOn(component, "getStep").mockReturnValue({
        state: "error" as STEP_STATE
      } as NgWizardStep);

      expect(component.isStepErrored(0)).toBe(true);
    });

    it("should work if there is no error", () => {
      jest.spyOn(component, "getStep").mockReturnValue({
        state: "normal" as STEP_STATE
      } as NgWizardStep);

      expect(component.isStepErrored(0)).toBe(false);
    });
  });

  describe("getStepTitle", () => {
    it("should show Step {{ stepNumber }} if there is no error", () => {
      jest.spyOn(component, "isStepErrored").mockReturnValue(false);
      expect(component.getStepTitle({ props: { label: "foo" } }, 0)).toEqual("foo");
    });

    it("should show Step {{ stepNumber }} with a star if there is an error", () => {
      jest.spyOn(component, "isStepErrored").mockReturnValue(true);
      expect(component.getStepTitle({ props: { label: "foo" } }, 0)).toEqual("foo*");
    });
  });

  describe("getState", () => {
    it("should work if there is no error", () => {
      jest.spyOn(component, "isValid").mockReturnValue(true);
      expect(component.getState(component.field)).toBe(STEP_STATE.normal);
    });

    it("should work if there is an error", () => {
      jest.spyOn(component, "isValid").mockReturnValue(false);
      expect(component.getState(component.field)).toBe(STEP_STATE.error);
    });
  });

  describe("isFirstStep", () => {
    it("should be true for step 0", () => {
      expect(component.isFirstStep(0)).toBe(true);
    });
    it("should be false for step 1", () => {
      expect(component.isFirstStep(1)).toBe(false);
    });
  });

  describe("goToPreviousStep", () => {
    it("should work", fakeAsync(() => {
      jest.spyOn(component.ngWizardService, "previous");
      jest.spyOn(component.windowRefService, "scroll");

      component.goToPreviousStep(null, 1);

      tick(101);

      expect(component.ngWizardService.previous).toHaveBeenCalled();
      expect(component.windowRefService.scroll).toHaveBeenCalled();
    }));
  });

  describe("goToNextStep", () => {
    it("should work", fakeAsync(() => {
      jest.spyOn(component.ngWizardService, "next");
      jest.spyOn(component.windowRefService, "scroll");

      component.goToNextStep(null, 0);

      tick(101);

      expect(component.ngWizardService.next).toHaveBeenCalled();
      expect(component.windowRefService.scroll).toHaveBeenCalled();
    }));
  });

  describe("setHighestVisitedStep", () => {
    it("should be 0 initially", () => {
      expect(component.highestVisitedStep).toBe(0);
    });

    it("should not change if set to the same value", () => {
      component.setHighestVisitedStep(0);
      expect(component.highestVisitedStep).toBe(0);
    });

    it("should not change if set to  lower value", () => {
      component.setHighestVisitedStep(-1);
      expect(component.highestVisitedStep).toBe(0);
    });

    it("should change if set to higher value", () => {
      component.setHighestVisitedStep(1);
      expect(component.highestVisitedStep).toBe(1);
    });
  });
});
