import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of, ReplaySubject } from "rxjs";

import { AssignEditProposalModalComponent } from "./assign-edit-proposal-modal.component";

describe("AssignEditProposalModalComponent", () => {
  let component: AssignEditProposalModalComponent;
  let fixture: ComponentFixture<AssignEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AssignEditProposalModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
