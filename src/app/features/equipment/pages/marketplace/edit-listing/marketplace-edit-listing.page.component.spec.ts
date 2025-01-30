import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { MarketplaceEditListingPageComponent } from "@features/equipment/pages/marketplace/edit-listing/marketplace-edit-listing-page.component";
import { ActivatedRoute } from "@angular/router";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { MarketplaceListingFormComponent } from "@features/equipment/components/marketplace-listing-form/marketplace-listing-form.component";
import { WindowRefService } from "@core/services/window-ref.service";

describe("MarketplaceEditListingPageComponent", () => {
  let component: MarketplaceEditListingPageComponent;
  let fixture: ComponentFixture<MarketplaceEditListingPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await MockBuilder(MarketplaceEditListingPageComponent, AppModule)
      .mock(MarketplaceListingFormComponent, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                listing: MarketplaceGenerator.listing()
              }
            }
          }
        },
        {
          provide: WindowRefService,
          useValue: {
            scroll: jest.fn()
          }
        }
      ])
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplaceEditListingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
