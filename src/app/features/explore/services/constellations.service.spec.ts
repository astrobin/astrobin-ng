import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { ConstellationsService } from "./constellations.service";

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
