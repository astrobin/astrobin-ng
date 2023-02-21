import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadDeepSkyAcquisitionPresetModalComponent } from "./load-deep-sky-acquisition-preset-modal.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("LoadDeepSkyAcquisitionPresetModalComponent", () => {
  let component: LoadDeepSkyAcquisitionPresetModalComponent;
  let fixture: ComponentFixture<LoadDeepSkyAcquisitionPresetModalComponent>;

  beforeEach(async () => {
    await MockBuilder(LoadDeepSkyAcquisitionPresetModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadDeepSkyAcquisitionPresetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
