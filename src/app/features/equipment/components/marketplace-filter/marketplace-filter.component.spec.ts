import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceFilterComponent } from "./marketplace-filter.component";
import { MockBuilder, MockProvider } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("MarketplaceFilterComponent", () => {
  let component: MarketplaceFilterComponent;
  let fixture: ComponentFixture<MarketplaceFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFilterComponent, AppModule).provide([
      provideMockStore({ initialState }),
      MockProvider(ActivatedRoute, {
        queryParams: of({ itemType: "TELESCOPE" })
      })
    ]);

    fixture = TestBed.createComponent(MarketplaceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
