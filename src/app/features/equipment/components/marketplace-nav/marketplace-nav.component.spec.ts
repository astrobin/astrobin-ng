import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceNavComponent } from "./marketplace-nav.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("MarketplaceNavComponent", () => {
  let component: MarketplaceNavComponent;
  let fixture: ComponentFixture<MarketplaceNavComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceNavComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }));

    fixture = TestBed.createComponent(MarketplaceNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
