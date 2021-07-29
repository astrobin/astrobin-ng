import { ComponentFixture, TestBed } from "@angular/core/testing";
import { EquipmentItemSummaryComponent } from "./equipment-item-summary.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("EquipmentItemSummaryComponent", () => {
  let component: EquipmentItemSummaryComponent;
  let fixture: ComponentFixture<EquipmentItemSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentItemSummaryComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentItemSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
