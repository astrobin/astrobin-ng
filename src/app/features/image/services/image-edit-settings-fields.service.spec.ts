import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageEditSettingsFieldsService } from "./image-edit-settings-fields.service";

describe("ImageEditSettingsFieldsService", () => {
  let service: ImageEditSettingsFieldsService;

  beforeEach(async () => {
    await MockBuilder(ImageEditSettingsFieldsService, ImageModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);
    service = TestBed.inject(ImageEditSettingsFieldsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
