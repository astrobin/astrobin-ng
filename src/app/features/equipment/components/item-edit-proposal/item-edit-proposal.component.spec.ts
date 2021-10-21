import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemEditProposalComponent } from "./item-edit-proposal.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";

describe("ItemEditProposalComponent", () => {
  let component: ItemEditProposalComponent;
  let fixture: ComponentFixture<ItemEditProposalComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemEditProposalComponent, AppModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEditProposalComponent);
    component = fixture.componentInstance;
    component.editProposal = CameraGenerator.editProposal();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
