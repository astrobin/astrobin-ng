import { Injectable } from "@angular/core";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { EMPTY, of } from "rxjs";
import { catchError, concatMap, delay, map, switchMap, tap } from "rxjs/operators";
import {
  LoadSubmissionQueueFailure,
  LoadSubmissionQueueSuccess,
  SubmissionQueueActions,
  SubmissionQueueActionTypes
} from "./submission-queue.actions";

@Injectable()
export class SubmissionQueueEffects {
  @Effect()
  loadSubmissionQueue$ = this.actions$.pipe(
    ofType(SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE),
    tap(() => this.loadingService.setLoading(true)),
    switchMap(() =>
      this.submissionQueueApiService.getEntries().pipe(
        map(entries => new LoadSubmissionQueueSuccess({ data: { entries } })),
        catchError(error => of(new LoadSubmissionQueueFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  loadSubmissionQueueSuccess$ = this.actions$.pipe(
    ofType(SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  loadSubmissionQueueFailure$ = this.actions$.pipe(
    ofType(SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  constructor(
    public readonly actions$: Actions<SubmissionQueueActions>,
    public readonly submissionQueueApiService: SubmissionQueueApiService,
    public readonly loadingService: LoadingService
  ) {}
}
