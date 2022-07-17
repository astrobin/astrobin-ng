import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";

import { RejectItemModalComponent } from "./reject-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("RejectItemModalComponent", () => {
  let component: RejectItemModalComponent;
  let fixture: ComponentFixture<RejectItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectItemModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectItemModalComponent);
    component = fixture.componentInstance;
    component.equipmentItem = CameraGenerator.camera();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
