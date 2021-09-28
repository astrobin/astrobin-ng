import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";

import { RejectEditProposalModalComponent } from "./reject-edit-proposal-modal.component";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

describe("RejectItemModalComponent", () => {
  let component: RejectEditProposalModalComponent;
  let fixture: ComponentFixture<RejectEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectEditProposalModalComponent, AppModule).provide(NgbActiveModal);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectEditProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
