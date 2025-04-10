import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { RejectReviewGearRenamingProposalsModalComponent } from "./reject-review-gear-renaming-proposals-modal.component";

describe("ReviewGearRenamingProposalsRejectModalComponent", () => {
  let component: RejectReviewGearRenamingProposalsModalComponent;
  let fixture: ComponentFixture<RejectReviewGearRenamingProposalsModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectReviewGearRenamingProposalsModalComponent, AppModule)
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide([provideMockStore({ initialState: initialMainState }), NgbActiveModal]);
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
