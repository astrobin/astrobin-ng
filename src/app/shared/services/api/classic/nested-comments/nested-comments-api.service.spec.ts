import { TestBed } from "@angular/core/testing";

import { NestedCommentsApiService } from "./nested-comments-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("NestedCommentsService", () => {
  let service: NestedCommentsApiService;

  beforeEach(async () => {
    await MockBuilder(NestedCommentsApiService, AppModule);
    service = TestBed.inject(NestedCommentsApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
