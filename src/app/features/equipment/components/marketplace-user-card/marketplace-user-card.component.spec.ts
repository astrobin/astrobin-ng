import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceUserCardComponent } from "./marketplace-user-card.component";

describe("MarketplaceUserCardComponent", () => {
  let component: MarketplaceUserCardComponent;
  let fixture: ComponentFixture<MarketplaceUserCardComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserCardComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );

    fixture = TestBed.createComponent(MarketplaceUserCardComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
