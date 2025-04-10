import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceImagesComponent } from "./marketplace-images.component";

describe("MarketplaceListingLineItemImagesComponent", () => {
  let component: MarketplaceImagesComponent;
  let fixture: ComponentFixture<MarketplaceImagesComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceImagesComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );

    fixture = TestBed.createComponent(MarketplaceImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
