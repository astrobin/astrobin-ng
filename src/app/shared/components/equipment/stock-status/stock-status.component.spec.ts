import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { EquipmentItemListingInterface } from "@features/equipment/types/equipment-listings.interface";
import { StockStatus } from "@features/equipment/types/stock-status.type";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { StockStatusComponent } from "./stock-status.component";

describe("StockStatusComponent", () => {
  let component: StockStatusComponent;
  let fixture: ComponentFixture<StockStatusComponent>;

  beforeEach(async () => {
    await MockBuilder(StockStatusComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }));
    fixture = TestBed.createComponent(StockStatusComponent);
    component = fixture.componentInstance;
    component.listing = {
      updated: "2021-08-31T14:00:00.000Z",
      stockStatus: StockStatus.UNKNOWN
    } as EquipmentItemListingInterface;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
