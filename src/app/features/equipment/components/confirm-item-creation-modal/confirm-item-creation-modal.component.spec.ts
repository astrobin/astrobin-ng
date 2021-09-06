import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmItemCreationModalComponent } from "./confirm-item-creation-modal.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("ConfirmItemCreationModalComponent", () => {
  let component: ConfirmItemCreationModalComponent;
  let fixture: ComponentFixture<ConfirmItemCreationModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ConfirmItemCreationModalComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmItemCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
