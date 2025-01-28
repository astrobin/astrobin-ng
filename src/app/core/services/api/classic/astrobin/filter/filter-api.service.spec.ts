import { TestBed } from "@angular/core/testing";
import { FilterApiService } from "./filter-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("FilterApiService", () => {
  let service: FilterApiService;

  beforeEach(async () => {
    await MockBuilder(FilterApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(FilterApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
