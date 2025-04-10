import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { WikipediaApiService } from "./wikipedia-api.service";

describe("WikipediaApiService", () => {
  let service: WikipediaApiService;

  beforeEach(async () => {
    await MockBuilder(WikipediaApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(WikipediaApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
