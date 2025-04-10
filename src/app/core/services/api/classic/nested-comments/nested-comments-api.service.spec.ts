import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { NestedCommentsApiService } from "./nested-comments-api.service";

describe("NestedCommentsService", () => {
  let service: NestedCommentsApiService;

  beforeEach(async () => {
    await MockBuilder(NestedCommentsApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(NestedCommentsApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
