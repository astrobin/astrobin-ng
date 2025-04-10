import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImportAcquisitionsFromCsvFormModalComponent } from "./import-acquisitions-from-csv-form-modal.component";

describe("CopyAcquisitionSessionsFromAnotherImageModalComponent", () => {
  let component: ImportAcquisitionsFromCsvFormModalComponent;
  let fixture: ComponentFixture<ImportAcquisitionsFromCsvFormModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ImportAcquisitionsFromCsvFormModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      ImageEditAcquisitionFieldsService,
      UtilsService,
      provideMockStore({ initialState: initialMainState })
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
