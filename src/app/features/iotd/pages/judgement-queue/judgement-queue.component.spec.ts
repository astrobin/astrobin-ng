import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockService } from "ng-mocks";
import { JudgementQueueComponent } from "./judgement-queue.component";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { QueueSortButtonComponent } from "@features/iotd/components/queue-sort-button/queue-sort-button.component";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { of } from "rxjs";
import { FutureIotdSlotsComponent } from "@features/iotd/components/future-iotd-slots/future-iotd-slots.component";
import { JudgementEntryComponent } from "@features/iotd/components/judgement-entry/judgement-entry.component";

describe("JudgementQueueComponent", () => {
  let component: JudgementQueueComponent;
  let fixture: ComponentFixture<JudgementQueueComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementQueueComponent, AppModule)
      .provide([IotdApiService, provideMockStore({ initialState })])
      .mock(QueueSortButtonComponent)
      .mock(FutureIotdSlotsComponent)
      .mock(JudgementEntryComponent);
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
    fixture = TestBed.createComponent(JudgementQueueComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.iotdApiService, "getCannotSelectNowReason").mockReturnValue(of(null));
    jest.spyOn(component.iotdApiService, "getNextAvailableSelectionTime").mockReturnValue(of(null));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
