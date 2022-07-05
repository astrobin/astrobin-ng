import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentCompareComponent } from "./equipment-compare.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { CompareService } from "@features/equipment/services/compare.service";

describe("CompareComponent", () => {
  let component: EquipmentCompareComponent;
  let fixture: ComponentFixture<EquipmentCompareComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentCompareComponent, AppModule).provide([
      provideMockStore({ initialState }),
      CompareService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
