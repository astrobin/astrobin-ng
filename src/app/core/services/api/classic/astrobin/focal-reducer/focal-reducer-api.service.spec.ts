import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { FocalReducerApiService } from "./focal-reducer-api.service";

describe("FocalReducerApiService", () => {
  let service: FocalReducerApiService;

  beforeEach(async () => {
    await MockBuilder(FocalReducerApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(FocalReducerApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
