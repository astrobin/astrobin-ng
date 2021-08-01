import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BrandSummaryComponent } from "./brand-summary.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("BrandSummaryComponent", () => {
  let component: BrandSummaryComponent;
  let fixture: ComponentFixture<BrandSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandSummaryComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
