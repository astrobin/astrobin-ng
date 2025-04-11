import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

describe("ImageEditAcquisitionFieldsService", () => {
  let service: ImageEditAcquisitionFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditAcquisitionFieldsService, ImageModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
    service = TestBed.inject(ImageEditAcquisitionFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
