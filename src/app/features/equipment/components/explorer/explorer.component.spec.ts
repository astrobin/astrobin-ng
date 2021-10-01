import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExplorerComponent } from "./explorer.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { ItemBrowserComponent } from "@features/equipment/components/item-browser/item-browser.component";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";

describe("ExplorerComponent", () => {
  let component: ExplorerComponent;
  let fixture: ComponentFixture<ExplorerComponent>;

  beforeEach(async () => {
    await MockBuilder(ExplorerComponent, AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())])
      .mock(ItemTypeNavComponent)
      .mock(ItemBrowserComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
