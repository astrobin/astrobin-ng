import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceSearchBarComponent } from "./marketplace-search-bar.component";
import { MockBuilder } from "ng-mocks";

describe("MarketplaceSearchBarComponent", () => {
  let component: MarketplaceSearchBarComponent;
  let fixture: ComponentFixture<MarketplaceSearchBarComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceSearchBarComponent);

    fixture = TestBed.createComponent(MarketplaceSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
