import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingsPageComponent } from "./marketplace-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";

describe("ListingsComponent", () => {
  let component: MarketplaceListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceListingsPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingsPageComponent, AppModule)
      .provide([provideMockStore({ initialState })])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplaceListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have a title", () => {
    const title = fixture.nativeElement.querySelector("h1 > span");
    expect(title.textContent).toContain("Equipment marketplace");
  });

  it("should have a button to create a listing", () => {
    const button = fixture.nativeElement.querySelector("h1 > .btn-create-listing");
    expect(button).toBeDefined();
  });

  it("should be in a loading state initially", () => {
    const nothingHere = fixture.nativeElement.querySelector("astrobin-nothing-here");
    const listings = fixture.nativeElement.querySelectorAll("astrobin-equipment-marketplace-listing");
    const loading = fixture.nativeElement.querySelector("astrobin-loading-indicator");
    expect(nothingHere).toBeFalsy();
    expect(listings.length).toEqual(0);
    expect(loading).toBeTruthy();
  });

  it("should show nothing here if there are no listings", () => {
    store.setState({ ...initialState, equipment: { ...initialState.equipment, marketplace: { listings: [] } } });

    fixture.detectChanges();

    console.log(fixture.nativeElement.innerHTML);

    const nothingHere = fixture.nativeElement.querySelector("astrobin-nothing-here");
    expect(nothingHere).toBeTruthy();
  });

  it("should show listings", () => {
    const listings = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1
        }
      ]
    };

    store.setState({
      ...initialState,
      equipment: { ...initialState.equipment, marketplace: { listings: listings.results } }
    });

    fixture.detectChanges();

    const nothingHere = fixture.nativeElement.querySelector("astrobin-nothing-here");
    expect(nothingHere).toBeFalsy();

    const listingElements = fixture.nativeElement.querySelectorAll(".listing");
    expect(listingElements.length).toEqual(listings.results.length);
  });
});
