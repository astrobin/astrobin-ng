import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RejectMigrationModalComponent } from "./reject-migration-modal.component";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { MockBuilder } from "ng-mocks";

describe("RejectMigrationModalComponent", () => {
  let component: RejectMigrationModalComponent;
  let fixture: ComponentFixture<RejectMigrationModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectMigrationModalComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectMigrationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
