import { TestBed } from "@angular/core/testing";

import { CameraApiService } from "./camera-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("CameraApiService", () => {
  let service: CameraApiService;

  beforeEach(async () => {
    await MockBuilder(CameraApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(CameraApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
