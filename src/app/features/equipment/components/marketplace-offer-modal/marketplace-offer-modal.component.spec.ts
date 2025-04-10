import { CurrencyPipe } from "@angular/common";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceOfferModalComponent } from "./marketplace-offer-modal.component";

describe("MarketplaceOfferModalComponent", () => {
  let component: MarketplaceOfferModalComponent;
  let fixture: ComponentFixture<MarketplaceOfferModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceOfferModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal,
      CurrencyPipe
    ]);

    fixture = TestBed.createComponent(MarketplaceOfferModalComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
