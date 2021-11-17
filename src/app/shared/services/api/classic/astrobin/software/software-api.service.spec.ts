import { TestBed } from "@angular/core/testing";
import { SoftwareApiService } from "./software-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("SoftwareApiService", () => {
  let service: SoftwareApiService;

  beforeEach(async () => {
    await MockBuilder(SoftwareApiService, AppModule);
    service = TestBed.inject(SoftwareApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
