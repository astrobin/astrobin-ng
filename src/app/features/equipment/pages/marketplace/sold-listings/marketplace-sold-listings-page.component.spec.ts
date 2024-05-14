import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceSoldListingsPageComponent } from "./marketplace-sold-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("SoldListingsComponent", () => {
  let component: MarketplaceSoldListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceSoldListingsPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await MockBuilder(MarketplaceSoldListingsPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ region: "us" })
          }
        }
      ])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplaceSoldListingsPageComponent);
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
});
