import { TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { SubscriptionsService } from "./subscriptions.service";

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: testAppImports });
    service = TestBed.inject(SubscriptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
