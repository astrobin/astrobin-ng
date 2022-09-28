import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemBrowserByPropertiesComponent } from "./item-browser-by-properties.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { of, ReplaySubject } from "rxjs";

describe("ItemBrowserByPropertiesModalComponent", () => {
  let component: ItemBrowserByPropertiesComponent;
  let fixture: ComponentFixture<ItemBrowserByPropertiesComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemBrowserByPropertiesComponent, AppModule).provide([
      provideMockStore({ initialState }),
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
