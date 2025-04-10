import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { ConfirmItemCreationModalComponent } from "./confirm-item-creation-modal.component";

describe("ConfirmItemCreationModalComponent", () => {
  let component: ConfirmItemCreationModalComponent;
  let fixture: ComponentFixture<ConfirmItemCreationModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ConfirmItemCreationModalComponent, EquipmentModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState }),
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
