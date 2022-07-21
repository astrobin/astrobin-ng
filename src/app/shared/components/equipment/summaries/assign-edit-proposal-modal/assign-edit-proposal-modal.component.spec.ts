import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignEditProposalModalComponent } from "./assign-edit-proposal-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { of, ReplaySubject } from "rxjs";
import { provideMockActions } from "@ngrx/effects/testing";

describe("AssignEditProposalModalComponent", () => {
  let component: AssignEditProposalModalComponent;
  let fixture: ComponentFixture<AssignEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AssignEditProposalModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>()),
      NgbActiveModal
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignEditProposalModalComponent);
    component = fixture.componentInstance;
    component.editProposal = CameraGenerator.editProposal();

    jest.spyOn(component.equipmentApiService, "getPossibleEditProposalAssignees").mockReturnValue(of([]));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
