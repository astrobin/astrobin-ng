import { TestBed } from "@angular/core/testing";

import { ImageEditSettingsFieldsService } from "./image-edit-settings-fields.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ImageEditSettingsFieldsService", () => {
  let service: ImageEditSettingsFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditSettingsFieldsService, ImageModule).provide([provideMockStore({ initialState })]);
    service = TestBed.inject(ImageEditSettingsFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
