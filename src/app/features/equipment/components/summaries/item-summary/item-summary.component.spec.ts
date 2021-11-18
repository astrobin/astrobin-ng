import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ItemSummaryComponent } from "./item-summary.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { AppModule } from "@app/app.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("EquipmentItemSummaryComponent", () => {
  let component: ItemSummaryComponent;
  let fixture: ComponentFixture<ItemSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemSummaryComponent, EquipmentModule)
      .mock(AppModule)
      .provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSummaryComponent);
    component = fixture.componentInstance;
    component.item = CameraGenerator.camera();
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
      expect(component.showLastUpdate()).toBe(false);
    });

    it("should be false when `created` and `updated` are less than a minute apart", () => {
      component.item = CameraGenerator.camera({
        created: "2020-01-01T00:00:00",
        updated: "2020-01-01T00:00:30"
      });
      expect(component.showLastUpdate()).toBe(false);
    });

    it("should be true when `created` and `updated` are a minute apart or more", () => {
      component.item = CameraGenerator.camera({
        created: "2020-01-01T00:00:00",
        updated: "2020-01-01T00:01:00"
      });
      expect(component.showLastUpdate()).toBe(true);
    });
  });
});
