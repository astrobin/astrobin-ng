import { TestBed } from "@angular/core/testing";
import { WikipediaApiService } from "./wikipedia-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

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
