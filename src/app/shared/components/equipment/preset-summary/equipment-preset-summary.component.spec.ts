import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { EquipmentPresetSummaryComponent } from "./equipment-preset-summary.component";

describe("PresetSummaryComponent", () => {
  let component: EquipmentPresetSummaryComponent;
  let fixture: ComponentFixture<EquipmentPresetSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentPresetSummaryComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);
    fixture = TestBed.createComponent(EquipmentPresetSummaryComponent);
    component = fixture.componentInstance;
    component.preset = {
      id: 1,
      name: "Test",
      user: 1,
      description: "Test",
      imagingTelescopes: [],
      guidingTelescopes: [],
      imagingCameras: [],
      guidingCameras: [],
      mounts: [],
      filters: [],
      accessories: [],
      software: []
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
