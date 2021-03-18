import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
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
      }
    ]);
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
