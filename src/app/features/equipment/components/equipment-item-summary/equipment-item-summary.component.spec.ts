import { ComponentFixture, TestBed } from "@angular/core/testing";
import { EquipmentItemSummaryComponent } from "./equipment-item-summary.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { AppModule } from "@app/app.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("EquipmentItemSummaryComponent", () => {
  let component: EquipmentItemSummaryComponent;
  let fixture: ComponentFixture<EquipmentItemSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentItemSummaryComponent, EquipmentModule)
      .mock(AppModule)
      .provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentItemSummaryComponent);
    component = fixture.componentInstance;
    component.item = CameraGenerator.camera();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
