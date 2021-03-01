import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { FormlyFieldStepperComponent } from "./formly-field-stepper.component";

describe("FormlyFieldStepperComponent", () => {
  let component: FormlyFieldStepperComponent;
  let fixture: ComponentFixture<FormlyFieldStepperComponent>;

  beforeEach(async () => {
    await MockBuilder(FormlyFieldStepperComponent, AppModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
