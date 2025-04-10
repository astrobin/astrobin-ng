import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { initialMainState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { SubmissionSlotsComponent } from "./submission-slots.component";

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
        provideMockStore({ initialState: initialMainState })
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
