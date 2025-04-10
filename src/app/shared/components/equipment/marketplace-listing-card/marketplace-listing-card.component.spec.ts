import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { MarketplaceListingCardComponent } from "./marketplace-listing-card.component";

describe("MarketplaceListingCardComponent", () => {
  let component: MarketplaceListingCardComponent;
  let fixture: ComponentFixture<MarketplaceListingCardComponent>;
  const camera = CameraGenerator.camera();

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingCardComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );

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
