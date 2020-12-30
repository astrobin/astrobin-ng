import { TestBed } from "@angular/core/testing";

import { IotdModule } from "@features/iotd/iotd.module";
import { MockBuilder } from "ng-mocks";
import { SubmissionQueueApiService } from "./submission-queue-api.service";

describe("SubmissionQueueApiService", () => {
  let service: SubmissionQueueApiService;

  beforeEach(async () => {
    await MockBuilder(SubmissionQueueApiService, IotdModule);
    service = TestBed.inject(SubmissionQueueApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
