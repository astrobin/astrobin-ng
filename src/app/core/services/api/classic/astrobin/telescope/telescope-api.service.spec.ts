import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { TelescopeApiService } from "./telescope-api.service";

describe("TelescopeApiService", () => {
  let service: TelescopeApiService;

  beforeEach(async () => {
    await MockBuilder(TelescopeApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(TelescopeApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
