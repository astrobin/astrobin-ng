import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { AdditionalSolarSystemAcquisitionPropertiesModalComponent } from "./additional-solar-system-acquisition-properties-modal.component";

describe("AdditionalsolarSystemAcquisitionPropertiesModalComponent", () => {
  let component: AdditionalSolarSystemAcquisitionPropertiesModalComponent;
  let fixture: ComponentFixture<AdditionalSolarSystemAcquisitionPropertiesModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AdditionalSolarSystemAcquisitionPropertiesModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
