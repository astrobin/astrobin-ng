import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UnapproveItemModalComponent } from "./unapprove-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";

describe("ApproveItemModalComponent", () => {
  let component: UnapproveItemModalComponent;
  let fixture: ComponentFixture<UnapproveItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(UnapproveItemModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState }),
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
