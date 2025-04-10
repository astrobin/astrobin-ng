import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceMoreFromUserComponent } from "./marketplace-more-from-user.component";

describe("MarketplaceMmoreFromUserComponent", () => {
  let component: MarketplaceMoreFromUserComponent;
  let fixture: ComponentFixture<MarketplaceMoreFromUserComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceMoreFromUserComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(MarketplaceMoreFromUserComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
