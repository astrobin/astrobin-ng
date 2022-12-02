import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";

describe("ImageEditAcquisitionFieldsService", () => {
  let service: ImageEditAcquisitionFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditAcquisitionFieldsService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditAcquisitionFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
