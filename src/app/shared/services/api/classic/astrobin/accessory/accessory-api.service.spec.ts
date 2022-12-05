import { TestBed } from "@angular/core/testing";
import { AccessoryApiService } from "./accessory-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

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
