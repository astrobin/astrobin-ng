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
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("JudgementQueueComponent", () => {
  let component: JudgementQueueComponent;
  let fixture: ComponentFixture<JudgementQueueComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementQueueComponent, AppModule)
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide([IotdApiService, provideMockStore({ initialState })])
      .mock(QueueSortButtonComponent, { export: true })
      .mock(FutureIotdSlotsComponent, { export: true })
      .mock(JudgementEntryComponent, { export: true });
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
