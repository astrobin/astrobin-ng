import { TestBed } from "@angular/core/testing";

import { ImageEditContentFieldsService } from "./image-edit-content-fields.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ImageEditContentFieldsService", () => {
  let service: ImageEditContentFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditContentFieldsService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditContentFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
