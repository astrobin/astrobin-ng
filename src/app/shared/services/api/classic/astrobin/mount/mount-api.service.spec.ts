import { TestBed } from "@angular/core/testing";
import { MountApiService } from "./mount-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("MountApiService", () => {
  let service: MountApiService;

  beforeEach(async () => {
    await MockBuilder(MountApiService, AppModule);
    service = TestBed.inject(MountApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
