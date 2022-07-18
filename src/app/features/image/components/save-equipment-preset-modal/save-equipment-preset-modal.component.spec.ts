import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SaveEquipmentPresetModalComponent } from "./save-equipment-preset-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("SaveEquipmentPresetModalComponent", () => {
  let component: SaveEquipmentPresetModalComponent;
  let fixture: ComponentFixture<SaveEquipmentPresetModalComponent>;

  beforeEach(async () => {
    await MockBuilder(SaveEquipmentPresetModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveEquipmentPresetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
