import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ExplorerFiltersComponent } from "./explorer-filters.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("ExplorerFiltersComponent", () => {
  let component: ExplorerFiltersComponent;
  let fixture: ComponentFixture<ExplorerFiltersComponent>;

  beforeEach(async () => {
    await MockBuilder(ExplorerFiltersComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorerFiltersComponent);
    component = fixture.componentInstance;
    component.type = EquipmentItemType.CAMERA;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
