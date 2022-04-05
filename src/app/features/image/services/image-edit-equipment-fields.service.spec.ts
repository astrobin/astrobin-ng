import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";

describe("ImageEditEquipmentFieldsService", () => {
  let service: ImageEditEquipmentFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditEquipmentFieldsService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditEquipmentFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
