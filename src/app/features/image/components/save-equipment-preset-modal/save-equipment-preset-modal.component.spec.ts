import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SaveEquipmentPresetModalComponent } from "./save-equipment-preset-modal.component";

describe("SaveEquipmentPresetModalComponent", () => {
  let component: SaveEquipmentPresetModalComponent;
  let fixture: ComponentFixture<SaveEquipmentPresetModalComponent>;

  beforeEach(async () => {
    await MockBuilder(SaveEquipmentPresetModalComponent, AppModule).provide([
      NgbActiveModal,
      ImageEditService,
      provideMockStore({ initialState: initialMainState })
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
