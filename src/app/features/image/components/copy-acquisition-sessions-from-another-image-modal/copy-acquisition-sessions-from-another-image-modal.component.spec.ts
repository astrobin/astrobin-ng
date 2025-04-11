import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { CopyAcquisitionSessionsFromAnotherImageModalComponent } from "./copy-acquisition-sessions-from-another-image-modal.component";

describe("CopyAcquisitionSessionsFromAnotherImageModalComponent", () => {
  let component: CopyAcquisitionSessionsFromAnotherImageModalComponent;
  let fixture: ComponentFixture<CopyAcquisitionSessionsFromAnotherImageModalComponent>;

  beforeEach(async () => {
    await MockBuilder(CopyAcquisitionSessionsFromAnotherImageModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      UtilsService,
      provideMockStore({ initialState: initialMainState })
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
