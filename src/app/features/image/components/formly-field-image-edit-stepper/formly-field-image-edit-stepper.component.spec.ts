import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { FormlyFieldImageEditStepperComponent } from "./formly-field-image-edit-stepper.component";

describe("FormlyFieldStepperComponent", () => {
  let component: FormlyFieldImageEditStepperComponent;
  let fixture: ComponentFixture<FormlyFieldImageEditStepperComponent>;

  beforeEach(async () => {
    await MockBuilder(FormlyFieldImageEditStepperComponent, AppModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldImageEditStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
