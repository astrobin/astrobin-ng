import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { ItemBrowserComponent } from "./item-browser.component";

describe("ItemBrowserComponent", () => {
  let component: ItemBrowserComponent;
  let fixture: ComponentFixture<ItemBrowserComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemBrowserComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
