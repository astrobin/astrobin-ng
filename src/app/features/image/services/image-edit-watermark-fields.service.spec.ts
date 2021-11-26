import { TestBed } from "@angular/core/testing";

import { ImageEditWatermarkFieldsService } from "./image-edit-watermark-fields.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ImageEditWatermarkFieldsService", () => {
  let service: ImageEditWatermarkFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditWatermarkFieldsService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditWatermarkFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
