import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ExplorerFiltersComponent } from "./explorer-filters.component";

describe("ExplorerFiltersComponent", () => {
  let component: ExplorerFiltersComponent;
  let fixture: ComponentFixture<ExplorerFiltersComponent>;

  beforeEach(async () => {
    await MockBuilder(ExplorerFiltersComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState: initialMainState })
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
