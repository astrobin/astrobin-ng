import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceMarkLineItemsAsSoldModalComponent } from "./marketplace-mark-line-items-as-sold-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

describe("MarketplaceMarkLineItemsAsSoldModalComponent", () => {
  let component: MarketplaceMarkLineItemsAsSoldModalComponent;
  let fixture: ComponentFixture<MarketplaceMarkLineItemsAsSoldModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceMarkLineItemsAsSoldModalComponent, AppModule).provide([
      provideMockStore({ initialState: {} }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(MarketplaceMarkLineItemsAsSoldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
