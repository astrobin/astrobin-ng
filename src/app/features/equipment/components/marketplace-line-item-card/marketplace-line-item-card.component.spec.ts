import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemCardComponent } from "./marketplace-line-item-card.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { of } from "rxjs";

describe("MarketplaceListingCardComponent", () => {
  let component: MarketplaceLineItemCardComponent;
  let fixture: ComponentFixture<MarketplaceLineItemCardComponent>;
  let camera = CameraGenerator.camera();

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemCardComponent, AppModule).provide(provideMockStore({ initialState }));

    fixture = TestBed.createComponent(MarketplaceLineItemCardComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    component.lineItem = component.listing.lineItems[0];

    jest.spyOn(component.equipmentMarketplaceService, "getLineItemEquipmentItem$").mockReturnValue(of(camera));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
