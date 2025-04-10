import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { GearUserInfoApiService } from "./gear-user-info-api.service";

describe("GearUserInfoApiService", () => {
  let service: GearUserInfoApiService;

  beforeEach(async () => {
    await MockBuilder(GearUserInfoApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(GearUserInfoApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
