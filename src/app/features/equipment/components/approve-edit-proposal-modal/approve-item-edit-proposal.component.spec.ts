import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";

import { ApproveEditProposalModalComponent } from "./approve-edit-proposal-modal.component";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

describe("ApproveItemModalComponent", () => {
  let component: ApproveEditProposalModalComponent;
  let fixture: ComponentFixture<ApproveEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ApproveEditProposalModalComponent, AppModule).provide(NgbActiveModal);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveEditProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
