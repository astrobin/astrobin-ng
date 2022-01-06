import { TestBed } from "@angular/core/testing";

import { ImageEditThumbnailFieldsService } from "./image-edit-thumbnail-fields.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ImageEditThumbnailFieldsService", () => {
  let service: ImageEditThumbnailFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditThumbnailFieldsService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditThumbnailFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
