import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ApproveEditProposalModalComponent } from "./approve-edit-proposal-modal.component";

describe("ApproveItemModalComponent", () => {
  let component: ApproveEditProposalModalComponent;
  let fixture: ComponentFixture<ApproveEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ApproveEditProposalModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState })
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
