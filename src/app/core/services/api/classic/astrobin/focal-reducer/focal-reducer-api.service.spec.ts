import { TestBed } from "@angular/core/testing";
import { FocalReducerApiService } from "./focal-reducer-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

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
