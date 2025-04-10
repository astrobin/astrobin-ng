import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { ThemeService } from "./theme.service";

describe("ThemeService", () => {
  let service: ThemeService;

  beforeEach(async () => {
    await MockBuilder(ThemeService, AppModule);
    service = TestBed.inject(ThemeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
