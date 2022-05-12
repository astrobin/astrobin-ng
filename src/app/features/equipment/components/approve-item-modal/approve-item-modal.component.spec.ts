import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ApproveItemModalComponent } from "./approve-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";

describe("ApproveItemModalComponent", () => {
  let component: ApproveItemModalComponent;
  let fixture: ComponentFixture<ApproveItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ApproveItemModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);
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
