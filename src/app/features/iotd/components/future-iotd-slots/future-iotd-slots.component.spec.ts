import { ComponentFixture, TestBed } from "@angular/core/testing";
import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { FutureIotdSlotsComponent } from "./future-iotd-slots.component";

describe("FutureIotdSlotsComponent", () => {
  let component: FutureIotdSlotsComponent;
  let fixture: ComponentFixture<FutureIotdSlotsComponent>;

  beforeEach(
    async () => await MockBuilder(FutureIotdSlotsComponent, IotdModule).provide(provideMockStore({ initialState }))
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
