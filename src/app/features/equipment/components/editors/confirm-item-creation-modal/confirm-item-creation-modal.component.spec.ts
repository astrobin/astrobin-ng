import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmItemCreationModalComponent } from "./confirm-item-creation-modal.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";

describe("ConfirmItemCreationModalComponent", () => {
  let component: ConfirmItemCreationModalComponent;
  let fixture: ComponentFixture<ConfirmItemCreationModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ConfirmItemCreationModalComponent, EquipmentModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmItemCreationModalComponent);
    component = fixture.componentInstance;
    component.item = CameraGenerator.camera();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
