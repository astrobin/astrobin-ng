import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageEditThumbnailFieldsService } from "./image-edit-thumbnail-fields.service";

describe("ImageEditThumbnailFieldsService", () => {
  let service: ImageEditThumbnailFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditThumbnailFieldsService, ImageModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
    service = TestBed.inject(ImageEditThumbnailFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
