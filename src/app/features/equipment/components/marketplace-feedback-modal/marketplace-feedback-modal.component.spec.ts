import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceFeedbackModalComponent } from "./marketplace-feedback-modal.component";

describe("MarketplaceFeedbackModalComponent", () => {
  let component: MarketplaceFeedbackModalComponent;
  let fixture: ComponentFixture<MarketplaceFeedbackModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFeedbackModalComponent, AppModule).provide([
      provideMockStore({ initialState: {} }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(MarketplaceFeedbackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
