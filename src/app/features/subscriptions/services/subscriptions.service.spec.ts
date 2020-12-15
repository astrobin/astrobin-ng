import { TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { SubscriptionsService } from "./subscriptions.service";

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    await MockBuilder(SubscriptionsService, AppModule);
    service = TestBed.inject(SubscriptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
