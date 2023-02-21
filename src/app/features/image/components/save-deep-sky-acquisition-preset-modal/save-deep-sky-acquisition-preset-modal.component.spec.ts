import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SaveDeepSkyAcquisitionPresetModalComponent } from "./save-deep-sky-acquisition-preset-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("SaveDeepSkyAcquisitionPresetModalComponent", () => {
  let component: SaveDeepSkyAcquisitionPresetModalComponent;
  let fixture: ComponentFixture<SaveDeepSkyAcquisitionPresetModalComponent>;

  beforeEach(async () => {
    await MockBuilder(SaveDeepSkyAcquisitionPresetModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveDeepSkyAcquisitionPresetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
