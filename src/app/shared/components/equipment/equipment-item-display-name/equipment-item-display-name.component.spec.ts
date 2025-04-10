import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { EquipmentItemDisplayNameComponent } from "./equipment-item-display-name.component";

describe("EquipmentItemDisplayNameComponent", () => {
  let component: EquipmentItemDisplayNameComponent;
  let fixture: ComponentFixture<EquipmentItemDisplayNameComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentItemDisplayNameComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
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
