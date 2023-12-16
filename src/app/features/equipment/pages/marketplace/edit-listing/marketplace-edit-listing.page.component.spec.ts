import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { MarketplaceEditListingPageComponent } from "@features/equipment/pages/marketplace/edit-listing/marketplace-edit-listing-page.component";
import { ActivatedRoute } from "@angular/router";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";

describe("MarketplaceEditListingPageComponent", () => {
  let component: MarketplaceEditListingPageComponent;
  let fixture: ComponentFixture<MarketplaceEditListingPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await MockBuilder(MarketplaceEditListingPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                listing: MarketplaceGenerator.listing()
              }
            }
          }
        }
      ])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplaceEditListingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have a title", () => {
    const title = fixture.nativeElement.querySelector("h1");
    expect(title.textContent).toContain("Edit listing");
  });
});
