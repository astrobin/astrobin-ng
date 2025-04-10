import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { AccessoryApiService } from "./accessory-api.service";

describe("AccessoryApiService", () => {
  let service: AccessoryApiService;

  beforeEach(async () => {
    await MockBuilder(AccessoryApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(AccessoryApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
