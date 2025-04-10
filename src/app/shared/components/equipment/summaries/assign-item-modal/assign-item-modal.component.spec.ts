import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of, ReplaySubject } from "rxjs";

import { AssignItemModalComponent } from "./assign-item-modal.component";

describe("AssignItemModalComponent", () => {
  let component: AssignItemModalComponent;
  let fixture: ComponentFixture<AssignItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AssignItemModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
