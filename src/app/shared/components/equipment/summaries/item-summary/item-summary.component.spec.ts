import { SimpleChange } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { ItemSummaryComponent } from "./item-summary.component";

describe("EquipmentItemSummaryComponent", () => {
  let component: ItemSummaryComponent;
  let fixture: ComponentFixture<ItemSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemSummaryComponent, EquipmentModule)
      .mock(AppModule, { export: true })
      .provide(provideMockStore({ initialState: initialMainState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSummaryComponent);
    component = fixture.componentInstance;
    component.item = CameraGenerator.camera();
    jest.spyOn(component.equipmentItemService, "getType").mockReturnValue(EquipmentItemType.CAMERA);
    jest.spyOn(component.cameraService, "getPrintableProperty$").mockReturnValue(of("value"));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("showLastUpdate", () => {
    it("should be false when `updated` is null", () => {
      component.item = CameraGenerator.camera({
        updated: null
      });
      component.ngOnChanges({ item: new SimpleChange(null, component.item, true) });
      fixture.detectChanges();
      expect(component.lastUpdateVisible).toBe(false);
    });

    it("should be false when `created` and `updated` are less than a minute apart", () => {
      component.item = CameraGenerator.camera({
        created: "2020-01-01T00:00:00",
        updated: "2020-01-01T00:00:30"
      });
      component.ngOnChanges({ item: new SimpleChange(null, component.item, true) });
      fixture.detectChanges();
      expect(component.lastUpdateVisible).toBe(false);
    });

    it("should be true when `created` and `updated` are a minute apart or more", () => {
      component.item = CameraGenerator.camera({
        created: "2020-01-01T00:00:00",
        updated: "2020-01-01T00:01:00"
      });
      component.ngOnChanges({ item: new SimpleChange(null, component.item, true) });
      fixture.detectChanges();
      expect(component.lastUpdateVisible).toBe(true);
    });
  });
});
