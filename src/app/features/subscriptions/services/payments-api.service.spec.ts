import { TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { PaymentsApiService } from "./payments-api.service";

describe("PaymentsApiService", () => {
  let service: PaymentsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [testAppImports] });
    service = TestBed.inject(PaymentsApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
