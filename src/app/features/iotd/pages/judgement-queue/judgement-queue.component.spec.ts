import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { FutureIotdSlotsComponent } from "@features/iotd/components/future-iotd-slots/future-iotd-slots.component";
import { JudgementEntryComponent } from "@features/iotd/components/judgement-entry/judgement-entry.component";
import { QueueSortButtonComponent } from "@features/iotd/components/queue-sort-button/queue-sort-button.component";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockService } from "ng-mocks";
import { of } from "rxjs";

import { JudgementQueueComponent } from "./judgement-queue.component";

describe("JudgementQueueComponent", () => {
  let component: JudgementQueueComponent;
  let fixture: ComponentFixture<JudgementQueueComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementQueueComponent, AppModule)
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide([IotdApiService, provideMockStore({ initialState: initialMainState })])
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
