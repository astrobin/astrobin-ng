import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentItemDisplayNameComponent } from "./equipment-item-display-name.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { of } from "rxjs";

describe("EquipmentItemDisplayNameComponent", () => {
  let component: EquipmentItemDisplayNameComponent;
  let fixture: ComponentFixture<EquipmentItemDisplayNameComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentItemDisplayNameComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentItemDisplayNameComponent);
    component = fixture.componentInstance;

    component.item = CameraGenerator.camera();
    jest.spyOn(component.equipmentItemService, "getName$").mockReturnValue(of(component.item.name));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
