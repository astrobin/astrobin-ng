import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { EquipmentListingsComponent } from "./equipment-listings.component";

describe("EquipmentListingsComponent", () => {
  let component: EquipmentListingsComponent;
  let fixture: ComponentFixture<EquipmentListingsComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentListingsComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentListingsComponent);
    component = fixture.componentInstance;

    component.item = TelescopeGenerator.telescope();
    component.listings = {
      brandListings: [],
      itemListings: [],
      allowFullRetailerIntegration: true
    };

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
