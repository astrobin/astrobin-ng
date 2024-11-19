import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentPresetComponent } from "./equipment-preset.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

describe("PresetComponent", () => {
  let component: EquipmentPresetComponent;
  let fixture: ComponentFixture<EquipmentPresetComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentPresetComponent, AppModule);
    fixture = TestBed.createComponent(EquipmentPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
