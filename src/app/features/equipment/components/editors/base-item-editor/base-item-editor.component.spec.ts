import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BaseItemEditorComponent } from "./base-item-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";

describe("BaseEquipmentItemEditorComponent", () => {
  let component: BaseItemEditorComponent<CameraInterface>;
  let fixture: ComponentFixture<BaseItemEditorComponent<CameraInterface>>;

  beforeEach(async () => {
    await MockBuilder(BaseItemEditorComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
