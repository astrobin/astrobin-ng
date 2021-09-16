import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemEditProposalComponent } from "./item-edit-proposal.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ItemEditProposalComponent", () => {
  let component: ItemEditProposalComponent;
  let fixture: ComponentFixture<ItemEditProposalComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemEditProposalComponent, EquipmentModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEditProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
