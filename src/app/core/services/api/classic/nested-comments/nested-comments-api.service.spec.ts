import { TestBed } from "@angular/core/testing";

import { NestedCommentsApiService } from "./nested-comments-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

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
