import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BaseEquipmentItemEditorComponent } from "./base-equipment-item-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("BaseEquipmentItemEditorComponent", () => {
  let component: BaseEquipmentItemEditorComponent;
  let fixture: ComponentFixture<BaseEquipmentItemEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(BaseEquipmentItemEditorComponent, EquipmentModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseEquipmentItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
