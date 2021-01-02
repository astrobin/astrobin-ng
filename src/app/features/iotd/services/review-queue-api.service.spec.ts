import { TestBed } from "@angular/core/testing";

import { IotdModule } from "@features/iotd/iotd.module";
import { ReviewQueueApiService } from "@features/iotd/services/review-queue-api.service";
import { MockBuilder } from "ng-mocks";

describe("ReviewQueueApiService", () => {
  let service: ReviewQueueApiService;

  beforeEach(async () => {
    await MockBuilder(ReviewQueueApiService, IotdModule);
    service = TestBed.inject(ReviewQueueApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
