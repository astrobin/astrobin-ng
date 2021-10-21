import { TestBed } from "@angular/core/testing";

import { CameraApiService } from "./camera-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("CameraApiService", () => {
  let service: CameraApiService;

  beforeEach(async () => {
    await MockBuilder(CameraApiService, AppModule);
    service = TestBed.inject(CameraApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
