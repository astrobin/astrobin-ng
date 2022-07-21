import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignItemModalComponent } from "./assign-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { of, ReplaySubject } from "rxjs";
import { provideMockActions } from "@ngrx/effects/testing";

describe("AssignItemModalComponent", () => {
  let component: AssignItemModalComponent;
  let fixture: ComponentFixture<AssignItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AssignItemModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>()),
      NgbActiveModal
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignItemModalComponent);
    component = fixture.componentInstance;
    component.item = CameraGenerator.camera();

    jest.spyOn(component.equipmentApiService, "getPossibleItemAssignees").mockReturnValue(of([]));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
