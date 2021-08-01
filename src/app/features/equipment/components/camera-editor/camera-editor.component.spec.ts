import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CameraEditorComponent } from "./camera-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("CameraEditorComponent", () => {
  let component: CameraEditorComponent;
  let fixture: ComponentFixture<CameraEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(CameraEditorComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
