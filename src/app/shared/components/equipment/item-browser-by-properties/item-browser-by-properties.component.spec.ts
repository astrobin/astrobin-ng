import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemBrowserByPropertiesComponent } from "./item-browser-by-properties.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ItemBrowserByPropertiesModalComponent", () => {
  let component: ItemBrowserByPropertiesComponent;
  let fixture: ComponentFixture<ItemBrowserByPropertiesComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemBrowserByPropertiesComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemBrowserByPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
