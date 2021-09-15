import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OthersInBrandComponent } from "./others-in-brand.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("OthersInBrandComponent", () => {
  let component: OthersInBrandComponent;
  let fixture: ComponentFixture<OthersInBrandComponent>;

  beforeEach(async () => {
    await MockBuilder(OthersInBrandComponent, EquipmentModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OthersInBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
