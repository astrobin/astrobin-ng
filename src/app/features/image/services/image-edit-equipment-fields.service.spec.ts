import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

describe("ImageEditEquipmentFieldsService", () => {
  let service: ImageEditEquipmentFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditEquipmentFieldsService, ImageModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
    service = TestBed.inject(ImageEditEquipmentFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
