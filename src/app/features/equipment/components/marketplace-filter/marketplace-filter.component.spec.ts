import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockProvider } from "ng-mocks";
import { of } from "rxjs";

import { MarketplaceFilterComponent } from "./marketplace-filter.component";

describe("MarketplaceFilterComponent", () => {
  let component: MarketplaceFilterComponent;
  let fixture: ComponentFixture<MarketplaceFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
