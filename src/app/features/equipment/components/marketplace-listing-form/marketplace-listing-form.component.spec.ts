import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingFormComponent } from "./marketplace-listing-form.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ActivatedRoute } from "@angular/router";

describe("MarketplaceListingFormComponent", () => {
  let component: MarketplaceListingFormComponent;
  let fixture: ComponentFixture<MarketplaceListingFormComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingFormComponent, AppModule).provide([
      provideMockStore({ initialState }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParams: {}
          }
        }
      }
    ]);
    fixture = TestBed.createComponent(MarketplaceListingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
