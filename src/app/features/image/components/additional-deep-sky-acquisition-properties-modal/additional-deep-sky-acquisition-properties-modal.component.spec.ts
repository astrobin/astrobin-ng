import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdditionalDeepSkyAcquisitionPropertiesModalComponent } from "./additional-deep-sky-acquisition-properties-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";

describe("AdditionalDeepSkyAcquisitionPropertiesModalComponent", () => {
  let component: AdditionalDeepSkyAcquisitionPropertiesModalComponent;
  let fixture: ComponentFixture<AdditionalDeepSkyAcquisitionPropertiesModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AdditionalDeepSkyAcquisitionPropertiesModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      NgbActiveModal,
      ImageEditService
    ]);

    fixture = TestBed.createComponent(AdditionalDeepSkyAcquisitionPropertiesModalComponent);
    component = fixture.componentInstance;
    component.imageEditService = TestBed.inject(ImageEditService);
    component.fieldGroup = [];
    component.index = 0;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
