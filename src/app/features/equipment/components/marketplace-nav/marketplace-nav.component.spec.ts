import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceNavComponent } from "./marketplace-nav.component";

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
