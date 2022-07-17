import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";

import { ApproveEditProposalModalComponent } from "./approve-edit-proposal-modal.component";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ApproveItemModalComponent", () => {
  let component: ApproveEditProposalModalComponent;
  let fixture: ComponentFixture<ApproveEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ApproveEditProposalModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState })
    ]);
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
