import { TestBed } from "@angular/core/testing";

import { ThemeService } from "./theme.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

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
