import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceImagesComponent } from "./marketplace-images.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("MarketplaceListingLineItemImagesComponent", () => {
  let component: MarketplaceImagesComponent;
  let fixture: ComponentFixture<MarketplaceImagesComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceImagesComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }));

    fixture = TestBed.createComponent(MarketplaceImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
