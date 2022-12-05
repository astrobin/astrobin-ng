import { TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { PaymentsApiService } from "./payments-api.service";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("PaymentsApiService", () => {
  let service: PaymentsApiService;

  beforeEach(async () => {
    await MockBuilder(PaymentsApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(PaymentsApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
