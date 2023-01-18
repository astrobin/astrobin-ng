import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdditionalSolarSystemAcquisitionPropertiesModalComponent } from "./additional-solar-system-acquisition-properties-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";

describe("AdditionalsolarSystemAcquisitionPropertiesModalComponent", () => {
  let component: AdditionalSolarSystemAcquisitionPropertiesModalComponent;
  let fixture: ComponentFixture<AdditionalSolarSystemAcquisitionPropertiesModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AdditionalSolarSystemAcquisitionPropertiesModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      NgbActiveModal,
      ImageEditService
    ]);

    fixture = TestBed.createComponent(AdditionalSolarSystemAcquisitionPropertiesModalComponent);
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
