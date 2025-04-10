import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of, ReplaySubject } from "rxjs";

import { ItemBrowserByPropertiesComponent } from "./item-browser-by-properties.component";

describe("ItemBrowserByPropertiesModalComponent", () => {
  let component: ItemBrowserByPropertiesComponent;
  let fixture: ComponentFixture<ItemBrowserByPropertiesComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemBrowserByPropertiesComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemBrowserByPropertiesComponent);
    component = fixture.componentInstance;

    jest
      .spyOn(component.equipmentApiService, "findAllEquipmentItems")
      .mockReturnValue(of({ count: 0, prev: null, next: null, results: [] }));

    jest
      .spyOn(component.equipmentApiService, "getBrandsByEquipmentType")
      .mockReturnValue(of({ count: 0, prev: null, next: null, results: [] }));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
