import { TestBed } from "@angular/core/testing";
import { ConstellationsService } from "./constellations.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("ConstellationsService", () => {
  let service: ConstellationsService;

  beforeEach(async () => {
    await MockBuilder(ConstellationsService, AppModule);
    service = TestBed.inject(ConstellationsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
