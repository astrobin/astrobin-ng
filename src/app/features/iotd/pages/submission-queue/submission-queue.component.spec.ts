import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { QueueSortButtonComponent } from "@features/iotd/components/queue-sort-button/queue-sort-button.component";
import { SubmissionEntryComponent } from "@features/iotd/components/submission-entry/submission-entry.component";
import { SubmissionSlotsComponent } from "@features/iotd/components/submission-slots/submission-slots.component";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockService } from "ng-mocks";

import { SubmissionQueueComponent } from "./submission-queue.component";

describe("SubmissionQueueComponent", () => {
  let component: SubmissionQueueComponent;
  let fixture: ComponentFixture<SubmissionQueueComponent>;

  beforeEach(async () => {
    await MockBuilder(SubmissionQueueComponent, AppModule)
      .provide(provideMockStore({ initialState: initialMainState }))
      .mock(QueueSortButtonComponent, { export: true })
      .mock(SubmissionEntryComponent, { export: true })
      .mock(SubmissionSlotsComponent, { export: true });
  });

  beforeEach(() =>
    MockInstance(ActivatedRoute, () => ({
      snapshot: MockService(ActivatedRouteSnapshot, {
        queryParamMap: {
          has: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          keys: []
        }
      })
    }))
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
