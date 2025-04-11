import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageEditContentFieldsService } from "./image-edit-content-fields.service";

describe("ImageEditContentFieldsService", () => {
  let service: ImageEditContentFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditContentFieldsService, ImageModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
    service = TestBed.inject(ImageEditContentFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
