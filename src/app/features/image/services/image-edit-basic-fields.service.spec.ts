import { TestBed } from "@angular/core/testing";

import { ImageEditBasicFieldsService } from "./image-edit-basic-fields.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";

describe("ImageEditBasicFieldsService", () => {
  let service: ImageEditBasicFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditBasicFieldsService, ImageModule);
    service = TestBed.inject(ImageEditBasicFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
