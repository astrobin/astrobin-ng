import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { GearApiService } from "./gear-api.service";

describe("GearApiService", () => {
  let service: GearApiService;

  beforeEach(async () => {
    await MockBuilder(GearApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(GearApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
