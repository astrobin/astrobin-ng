import { TestBed } from "@angular/core/testing";
import { TelescopeApiService } from "./telescope-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("TelescopeApiService", () => {
  let service: TelescopeApiService;

  beforeEach(async () => {
    await MockBuilder(TelescopeApiService, AppModule);
    service = TestBed.inject(TelescopeApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
