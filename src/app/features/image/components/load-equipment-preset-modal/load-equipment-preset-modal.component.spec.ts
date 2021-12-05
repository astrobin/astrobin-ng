import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadEquipmentPresetModalComponent } from "./load-equipment-preset-modal.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("LoadEquipmentPresetModalComponent", () => {
  let component: LoadEquipmentPresetModalComponent;
  let fixture: ComponentFixture<LoadEquipmentPresetModalComponent>;

  beforeEach(async () => {
    await MockBuilder(LoadEquipmentPresetModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadEquipmentPresetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
