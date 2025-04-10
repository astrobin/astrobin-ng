import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { RejectEditProposalModalComponent } from "./reject-edit-proposal-modal.component";

describe("RejectItemModalComponent", () => {
  let component: RejectEditProposalModalComponent;
  let fixture: ComponentFixture<RejectEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectEditProposalModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState })
    ]);
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
