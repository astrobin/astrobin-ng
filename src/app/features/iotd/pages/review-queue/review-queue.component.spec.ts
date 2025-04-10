import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { QueueSortButtonComponent } from "@features/iotd/components/queue-sort-button/queue-sort-button.component";
import { ReviewEntryComponent } from "@features/iotd/components/review-entry/review-entry.component";
import { ReviewSlotsComponent } from "@features/iotd/components/review-slots/review-slots.component";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockService } from "ng-mocks";

import { ReviewQueueComponent } from "./review-queue.component";

describe("ReviewQueueComponent", () => {
  let component: ReviewQueueComponent;
  let fixture: ComponentFixture<ReviewQueueComponent>;

  beforeEach(async () => {
    await MockBuilder(ReviewQueueComponent, AppModule)
      .provide(provideMockStore({ initialState: initialMainState }))
      .mock(QueueSortButtonComponent, { export: true })
      .mock(ReviewEntryComponent, { export: true })
      .mock(ReviewSlotsComponent, { export: true });
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
    fixture = TestBed.createComponent(ReviewQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
