import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { initialMainState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { FutureIotdSlotsComponent } from "./future-iotd-slots.component";

describe("FutureIotdSlotsComponent", () => {
  let component: FutureIotdSlotsComponent;
  let fixture: ComponentFixture<FutureIotdSlotsComponent>;

  beforeEach(
    async () =>
      await MockBuilder(FutureIotdSlotsComponent, IotdModule).provide([
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
    fixture = TestBed.createComponent(FutureIotdSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
