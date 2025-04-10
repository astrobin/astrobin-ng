import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { CompareService } from "@features/equipment/services/compare.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { EquipmentCompareComponent } from "./equipment-compare.component";

describe("CompareComponent", () => {
  let component: EquipmentCompareComponent;
  let fixture: ComponentFixture<EquipmentCompareComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentCompareComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState: initialMainState }),
      CompareService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
