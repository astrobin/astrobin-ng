import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceFeedbackModalComponent } from "./marketplace-feedback-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

describe("MarketplaceFeedbackModalComponent", () => {
  let component: MarketplaceFeedbackModalComponent;
  let fixture: ComponentFixture<MarketplaceFeedbackModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFeedbackModalComponent, AppModule).provide([
      provideMockStore({ initialState: {} }),
      NgbModal
    ]);

    fixture = TestBed.createComponent(MarketplaceFeedbackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
