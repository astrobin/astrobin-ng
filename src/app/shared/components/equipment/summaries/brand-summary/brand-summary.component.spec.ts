import { ComponentFixture, TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { BrandSummaryComponent } from "./brand-summary.component";

describe("BrandSummaryComponent", () => {
  let component: BrandSummaryComponent;
  let fixture: ComponentFixture<BrandSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandSummaryComponent, EquipmentModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandSummaryComponent);
    component = fixture.componentInstance;
    component.brand = BrandGenerator.brand();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
