import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { MarketplaceSearchBarComponent } from "./marketplace-search-bar.component";

describe("MarketplaceSearchBarComponent", () => {
  let component: MarketplaceSearchBarComponent;
  let fixture: ComponentFixture<MarketplaceSearchBarComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceSearchBarComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
