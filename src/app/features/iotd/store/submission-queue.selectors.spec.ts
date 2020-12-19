import * as fromSubmissionQueue from "./submission-queue.reducer";
import { selectSubmissionQueueState } from "./submission-queue.selectors";

describe("SubmissionQueue Selectors", () => {
  it("should select the feature state", () => {
    const result = selectSubmissionQueueState({
      [fromSubmissionQueue.submissionQueueFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
