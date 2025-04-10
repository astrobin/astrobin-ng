import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { UnapproveItemModalComponent } from "./unapprove-item-modal.component";

describe("ApproveItemModalComponent", () => {
  let component: UnapproveItemModalComponent;
  let fixture: ComponentFixture<UnapproveItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(UnapproveItemModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnapproveItemModalComponent);
    component = fixture.componentInstance;
    component.equipmentItem = CameraGenerator.camera();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
