import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageEditBasicFieldsService } from "./image-edit-basic-fields.service";

describe("ImageEditBasicFieldsService", () => {
  let service: ImageEditBasicFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditBasicFieldsService, ImageModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
    service = TestBed.inject(ImageEditBasicFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
