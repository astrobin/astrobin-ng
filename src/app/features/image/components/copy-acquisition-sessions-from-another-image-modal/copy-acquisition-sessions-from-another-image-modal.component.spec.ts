import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CopyAcquisitionSessionsFromAnotherImageModalComponent } from "./copy-acquisition-sessions-from-another-image-modal.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";

describe("CopyAcquisitionSessionsFromAnotherImageModalComponent", () => {
  let component: CopyAcquisitionSessionsFromAnotherImageModalComponent;
  let fixture: ComponentFixture<CopyAcquisitionSessionsFromAnotherImageModalComponent>;

  beforeEach(async () => {
    await MockBuilder(CopyAcquisitionSessionsFromAnotherImageModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      UtilsService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyAcquisitionSessionsFromAnotherImageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
