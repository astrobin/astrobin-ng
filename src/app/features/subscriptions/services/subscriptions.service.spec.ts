import { TestBed } from "@angular/core/testing";

import { SubscriptionsService } from "./subscriptions.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

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
