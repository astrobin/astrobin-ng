import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { MarketplaceListingFormComponent } from "@features/equipment/components/marketplace-listing-form/marketplace-listing-form.component";
import { MarketplaceCreateListingPageComponent } from "@features/equipment/pages/marketplace/create-listing/marketplace-create-listing-page.component";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

describe("MarketplaceCreateListingPageComponent", () => {
  let component: MarketplaceCreateListingPageComponent;
  let fixture: ComponentFixture<MarketplaceCreateListingPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceCreateListingPageComponent, AppModule)
      .mock(MarketplaceListingFormComponent, { export: true })
      .provide([provideMockStore({ initialState: initialMainState })])
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplaceCreateListingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
