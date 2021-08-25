import { ComponentFixture } from "@angular/core/testing";
import { EquipmentItemSummaryComponent } from "./equipment-item-summary.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { AppModule } from "@app/app.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";

describe("EquipmentItemSummaryComponent", () => {
  let component: EquipmentItemSummaryComponent;
  let fixture: ComponentFixture<EquipmentItemSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentItemSummaryComponent, EquipmentModule).mock(AppModule);
  });

  beforeEach(() => {
    fixture = MockRender(EquipmentItemSummaryComponent);
    component = fixture.componentInstance;
    component.item = CameraGenerator.camera();
    component.brand = BrandGenerator.brand();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
