import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MigrationReviewComponent } from "./migration-review.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("MigrationReviewComponent", () => {
  let component: MigrationReviewComponent;
  let fixture: ComponentFixture<MigrationReviewComponent>;

  beforeEach(async () => {
    await MockBuilder(MigrationReviewComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
