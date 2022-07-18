import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemBrowserComponent } from "./item-browser.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

describe("ItemBrowserComponent", () => {
  let component: ItemBrowserComponent;
  let fixture: ComponentFixture<ItemBrowserComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemBrowserComponent, AppModule).provide([
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>()),
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemBrowserComponent);
    component = fixture.componentInstance;
    component.type = EquipmentItemType.CAMERA;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
