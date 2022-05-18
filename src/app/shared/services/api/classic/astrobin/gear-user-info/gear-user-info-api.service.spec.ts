import { TestBed } from "@angular/core/testing";

import { GearUserInfoApiService } from "./gear-user-info-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("GearUserInfoApiService", () => {
  let service: GearUserInfoApiService;

  beforeEach(async () => {
    await MockBuilder(GearUserInfoApiService, AppModule);
    service = TestBed.inject(GearUserInfoApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
