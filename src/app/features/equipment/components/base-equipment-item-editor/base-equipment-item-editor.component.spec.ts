import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BaseEquipmentItemEditorComponent } from "./base-equipment-item-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";

describe("BaseEquipmentItemEditorComponent", () => {
  let component: BaseEquipmentItemEditorComponent;
  let fixture: ComponentFixture<BaseEquipmentItemEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(BaseEquipmentItemEditorComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())]);
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
