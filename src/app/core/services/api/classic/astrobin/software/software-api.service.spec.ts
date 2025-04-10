import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { SoftwareApiService } from "./software-api.service";

describe("SoftwareApiService", () => {
  let service: SoftwareApiService;

  beforeEach(async () => {
    await MockBuilder(SoftwareApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(SoftwareApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
