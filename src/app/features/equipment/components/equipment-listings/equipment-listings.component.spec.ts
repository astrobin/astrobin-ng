import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentListingsComponent } from "./equipment-listings.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { UtilsService } from "@shared/services/utils/utils.service";

describe("EquipmentListingsComponent", () => {
  let component: EquipmentListingsComponent;
  let fixture: ComponentFixture<EquipmentListingsComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentListingsComponent, AppModule).provide([
      provideMockStore({ initialState }),
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
