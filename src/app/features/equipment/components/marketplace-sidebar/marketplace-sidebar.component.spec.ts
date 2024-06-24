import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceSidebarComponent } from "./marketplace-sidebar.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceSidebarComponent", () => {
  let component: MarketplaceSidebarComponent;
  let fixture: ComponentFixture<MarketplaceSidebarComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceSidebarComponent, AppModule).provide([provideMockStore({ initialState })]);

    fixture = TestBed.createComponent(MarketplaceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
