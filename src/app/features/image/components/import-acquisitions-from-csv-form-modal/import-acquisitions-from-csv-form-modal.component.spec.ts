import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImportAcquisitionsFromCsvFormModalComponent } from "./import-acquisitions-from-csv-form-modal.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";

describe("CopyAcquisitionSessionsFromAnotherImageModalComponent", () => {
  let component: ImportAcquisitionsFromCsvFormModalComponent;
  let fixture: ComponentFixture<ImportAcquisitionsFromCsvFormModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ImportAcquisitionsFromCsvFormModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      ImageEditAcquisitionFieldsService,
      UtilsService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAcquisitionsFromCsvFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
