import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { Observable } from "rxjs";

import { SubmissionQueueEffects } from "./submission-queue.effects";

describe("SubmissionQueueEffects", () => {
  let actions$: Observable<any>;
  let effects: SubmissionQueueEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubmissionQueueEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SubmissionQueueEffects);
  });

  it("should be created", () => {
    expect(effects).toBeTruthy();
  });
});
