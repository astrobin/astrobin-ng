import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentPresetComponent } from "./equipment-preset.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("PresetComponent", () => {
  let component: EquipmentPresetComponent;
  let fixture: ComponentFixture<EquipmentPresetComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentPresetComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
    ]);
    fixture = TestBed.createComponent(EquipmentPresetComponent);
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
    }
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
