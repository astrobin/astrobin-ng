import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RejectReviewGearRenamingProposalsModalComponent } from "./reject-review-gear-renaming-proposals-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ReviewGearRenamingProposalsRejectModalComponent", () => {
  let component: RejectReviewGearRenamingProposalsModalComponent;
  let fixture: ComponentFixture<RejectReviewGearRenamingProposalsModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectReviewGearRenamingProposalsModalComponent, AppModule)
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide([provideMockStore({ initialState }), NgbActiveModal]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectReviewGearRenamingProposalsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
