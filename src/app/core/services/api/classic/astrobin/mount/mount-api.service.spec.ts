import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { MountApiService } from "./mount-api.service";

describe("MountApiService", () => {
  let service: MountApiService;

  beforeEach(async () => {
    await MockBuilder(MountApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(MountApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
