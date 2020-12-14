import { TestBed } from "@angular/core/testing";

import { PaymentsApiService } from "./payments-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("PaymentsApiService", () => {
  let service: PaymentsApiService;

  beforeEach(async () => {
    await MockBuilder(PaymentsApiService, AppModule);
    service = TestBed.inject(PaymentsApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
