import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceMarkLineItemsAsSoldModalComponent } from "./marketplace-mark-line-items-as-sold-modal.component";

describe("MarketplaceMarkLineItemsAsSoldModalComponent", () => {
  let component: MarketplaceMarkLineItemsAsSoldModalComponent;
  let fixture: ComponentFixture<MarketplaceMarkLineItemsAsSoldModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceMarkLineItemsAsSoldModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(MarketplaceMarkLineItemsAsSoldModalComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing({ lineItems: [MarketplaceGenerator.lineItem()] });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
