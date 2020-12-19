import { TestBed } from "@angular/core/testing";

import { SubmissionQueueApiService } from "./submission-queue-api.service";

describe("SubmissionQueueApiService", () => {
  let service: SubmissionQueueApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmissionQueueApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
