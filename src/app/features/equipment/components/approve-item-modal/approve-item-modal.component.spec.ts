import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ApproveItemModalComponent } from "./approve-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";

describe("ApproveItemModalComponent", () => {
  let component: ApproveItemModalComponent;
  let fixture: ComponentFixture<ApproveItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ApproveItemModalComponent, AppModule).provide(NgbActiveModal);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveItemModalComponent);
    component = fixture.componentInstance;
    component.equipmentItem = CameraGenerator.camera();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
