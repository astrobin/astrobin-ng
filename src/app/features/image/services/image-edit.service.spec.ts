import { TestBed } from "@angular/core/testing";

import { ImageEditService } from "./image-edit.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";

describe("ImageEditService", () => {
  let service: ImageEditService;

  beforeEach(async () => {
    await MockBuilder(ImageEditService, ImageModule);
    service = TestBed.inject(ImageEditService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
