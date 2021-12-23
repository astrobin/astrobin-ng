import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockService } from "ng-mocks";
import { ReviewQueueComponent } from "./review-queue.component";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { QueueSortButtonComponent } from "@features/iotd/components/queue-sort-button/queue-sort-button.component";
import { ReviewSlotsComponent } from "@features/iotd/components/review-slots/review-slots.component";
import { ReviewEntryComponent } from "@features/iotd/components/review-entry/review-entry.component";

describe("ReviewQueueComponent", () => {
  let component: ReviewQueueComponent;
  let fixture: ComponentFixture<ReviewQueueComponent>;

  beforeEach(async () => {
    await MockBuilder(ReviewQueueComponent, AppModule)
      .provide(provideMockStore({ initialState }))
      .mock(QueueSortButtonComponent)
      .mock(ReviewEntryComponent)
      .mock(ReviewSlotsComponent);
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
