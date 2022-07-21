import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignEditProposalModalComponent } from "./assign-edit-proposal-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("AssignEditProposalModalComponent", () => {
  let component: AssignEditProposalModalComponent;
  let fixture: ComponentFixture<AssignEditProposalModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AssignEditProposalModalComponent, AppModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignEditProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
