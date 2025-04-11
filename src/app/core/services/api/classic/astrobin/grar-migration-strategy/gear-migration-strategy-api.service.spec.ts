import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { GearMigrationStrategyApiService } from "./gear-migration-strategy-api.service";

describe("GearMigrationStrategyApiService", () => {
  let service: GearMigrationStrategyApiService;

  beforeEach(async () => {
    await MockBuilder(GearMigrationStrategyApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(GearMigrationStrategyApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
