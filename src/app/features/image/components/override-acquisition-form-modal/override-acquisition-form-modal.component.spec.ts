import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { OverrideAcquisitionFormModalComponent } from "./override-acquisition-form-modal.component";

describe("CopyAcquisitionSessionsFromAnotherImageModalComponent", () => {
  let component: OverrideAcquisitionFormModalComponent;
  let fixture: ComponentFixture<OverrideAcquisitionFormModalComponent>;

  beforeEach(async () => {
    await MockBuilder(OverrideAcquisitionFormModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      UtilsService,
      provideMockStore({ initialState: initialMainState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverrideAcquisitionFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
