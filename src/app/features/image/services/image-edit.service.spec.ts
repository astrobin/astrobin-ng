import { TestBed } from "@angular/core/testing";

import { ImageEditService } from "./image-edit.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ImageEditService", () => {
  let service: ImageEditService;

  beforeEach(async () => {
    await MockBuilder(ImageEditService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
