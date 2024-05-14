import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceSearchBarComponent } from "./marketplace-search-bar.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("MarketplaceSearchBarComponent", () => {
  let component: MarketplaceSearchBarComponent;
  let fixture: ComponentFixture<MarketplaceSearchBarComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceSearchBarComponent, AppModule).provide([
      provideMockStore({ initialState }),
      {
        provide: ActivatedRoute,
        useValue: {
          queryParams: of({ region: "us" })
        }
      }
    ]);

    fixture = TestBed.createComponent(MarketplaceSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
