import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { EquipmentPresetEditorComponent } from "./equipment-preset-editor.component";

describe("PresetEditorComponent", () => {
  let component: EquipmentPresetEditorComponent;
  let fixture: ComponentFixture<EquipmentPresetEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentPresetEditorComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);
    fixture = TestBed.createComponent(EquipmentPresetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
