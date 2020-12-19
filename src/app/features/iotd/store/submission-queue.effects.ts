import { Injectable } from "@angular/core";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { EMPTY, of } from "rxjs";
import { catchError, concatMap, map, switchMap, tap } from "rxjs/operators";
import {
  LoadSubmissionQueueSuccess,
  SubmissionQueueActions,
  SubmissionQueueActionTypes
} from "./submission-queue.actions";

@Injectable()
export class SubmissionQueueEffects {
  @Effect()
  loadSubmissionQueue$ = this.actions$.pipe(
    ofType(SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE),
    switchMap(() =>
      this.submissionQueueApiService.getEntries().pipe(
        map(entries => new LoadSubmissionQueueSuccess({ data: { entries } })),
        catchError(error => EMPTY)
      )
    )
  );

  @Effect({ dispatch: false })
  loadSubmissionQueueSuccess$ = this.actions$.pipe(ofType(SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS));

  constructor(
    public readonly actions$: Actions<SubmissionQueueActions>,
    public readonly submissionQueueApiService: SubmissionQueueApiService
  ) {}
}
