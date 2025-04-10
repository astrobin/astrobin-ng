import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { AstroUtilsService } from "./astro-utils.service";

describe("AstroUtilsService", () => {
  let service: AstroUtilsService;

  beforeEach(async () => {
    await MockBuilder(AstroUtilsService, AppModule);
    service = TestBed.inject(AstroUtilsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
