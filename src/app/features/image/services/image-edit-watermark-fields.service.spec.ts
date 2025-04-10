import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageEditWatermarkFieldsService } from "./image-edit-watermark-fields.service";

describe("ImageEditWatermarkFieldsService", () => {
  let service: ImageEditWatermarkFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditWatermarkFieldsService, ImageModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
    service = TestBed.inject(ImageEditWatermarkFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
