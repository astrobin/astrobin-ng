import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingCardComponent } from "./marketplace-listing-card.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { of } from "rxjs";

describe("MarketplaceListingCardComponent", () => {
  let component: MarketplaceListingCardComponent;
  let fixture: ComponentFixture<MarketplaceListingCardComponent>;
  let camera = CameraGenerator.camera();

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingCardComponent, AppModule).provide(provideMockStore({ initialState }));

    fixture = TestBed.createComponent(MarketplaceListingCardComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();

    jest.spyOn(component.equipmentMarketplaceService, "getLineItemEquipmentItem$").mockReturnValue(of(camera));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
