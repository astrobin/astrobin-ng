import { HttpClient, HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { FeedApiService } from "./feed-api.service";

describe("FeedApiService", () => {
  let service: FeedApiService;

  beforeEach(async () => {
    await MockBuilder(FeedApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(FeedApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
