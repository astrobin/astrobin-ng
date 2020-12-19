import * as SubmissionQueueActions from "./submission-queue.actions";

describe("SubmissionQueue", () => {
  it("should create an instance", () => {
    expect(new SubmissionQueueActions.LoadSubmissionQueue()).toBeTruthy();
  });
});
