import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { SubmissionSlotsComponent } from "./submission-slots.component";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("SubmissionSlotsComponent", () => {
  let component: SubmissionSlotsComponent;
  let fixture: ComponentFixture<SubmissionSlotsComponent>;

  beforeEach(
    async () =>
      await MockBuilder(SubmissionSlotsComponent, IotdModule).provide([
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of("")
          }
        },
        provideMockStore({ initialState })
      ])
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
